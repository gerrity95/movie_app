import asyncio
from base.mongoclient import MongoClient
from base.tmdbclient import TmdbClient
from base.recc_calculator import ReccCalculator
from collections import Counter
import json
import datetime
from bson import ObjectId, encode

class JSONEncoder(json.JSONEncoder):
    def default(self, o):
        if isinstance(o, (ObjectId, datetime.datetime)):
            return str(o)
        return json.JSONEncoder.default(self, o)

class RecommendationException(Exception):
    """
    class to handle exceptions in the Recommendations class
    """

class Recommendations:
    
    def __init__(self) -> None:
        self.mongo_client = MongoClient()
        self.tmdb_client = TmdbClient()
        self.recc_calculator = ReccCalculator()
        
    async def calculate_reccs(self, user_id: str):
        """
        Check if there are currently reccs stored for the given user_id
        if no reccs:
            gather_reccs_data
            store_reccs_data
            return reccs_data
        else if reccs:
            recent_reviewed = Get timestamp for most recent rated movie (stored)
            if recent_reviewed is more recent than reccs_data updated:
                gather_reccs_data
                store_reccs_data
                return reccs_data
            else:
                return reccs_data
        """
        #return 'hello', None
        stored_reccs, error = await self.query_mongo_for_user(user_id, 'recommended_movies')
        if error:
            print(f"Error {error} attempting to get reccommended movies")
            return None, RecommendationException
        if stored_reccs:
            try:
                encoded_reccs = JSONEncoder().encode(stored_reccs[0])
                encoded_reccs = json.loads(encoded_reccs)
                need_new_reccs, error = await self.compare_reccs_with_rated(user_id=user_id, encoded_reccs=encoded_reccs)
                if error:
                    print(f"Error {error} seen attempting to compare recommendations with rated movies")
                    return None, RecommendationException    
            except Exception as e:
                print(f"Error {e} seen attempting to compare recommendations with rated movies")
                return None, RecommendationException
        else:
            print("No recommendations have been generated. Attempting to populate now....")
            recommendations, error = await self.process_recommendations(user_id=user_id, is_new=True)
            return recommendations, error
        
        if need_new_reccs:
            print(f"Recommendations have expired for user {user_id}. Attempting to update...")
            recommendations, error = await self.process_recommendations(user_id=user_id, is_new=False, existing_reccs_id=stored_reccs[0]['_id'])
            return recommendations, error
        else:
            print(f"Recommendations are up to date for user {user_id}. Will not attempt to update")
            return encoded_reccs['recommendations'], None
        
    async def process_recommendations(self, user_id: str, is_new: bool, existing_reccs_id: str = None):
        """
        A function to gather and process all recommendations for the given user
        """
        rec_collection = self.mongo_client.recommended_collection()
        reccs_data, error = await self.gather_reccs_data(user_id)
        if error:
            print("Error attempting to get rated movies")
            return None, RecommendationException("Error attempting to gather recommendation data")
        
        try:
            print("Attempting to process recommendation data...")
            sorted_reccomendations = self.recc_calculator.do_calculate(tmdb_data=json.loads(reccs_data))
            if is_new:
                print("First time generating recommendations. Appending to Mongo...")
                document = {'user_id': user_id, 'recommendations': sorted_reccomendations,
                            'createdAt': datetime.datetime.now(), 'updatedAt': datetime.datetime.now()}
                result = await rec_collection.insert_one(document)
                print(result)
            else:
                print("Updating recommendations in Mongo...")
                result = await rec_collection.update_one({'_id': existing_reccs_id}, {'$set': {'recommendations': sorted_reccomendations}, '$currentDate': { 'updatedAt': True }})
                print(result)
            return sorted_reccomendations, None
        except Exception as err:
            print(f"Error {err} seen when attempting to calculate reccommendations")
            return None, Exception(str(err))
    
    async def compare_reccs_with_rated(self, user_id, encoded_reccs: dict):
        """
        Function to compare the stored reccs with the most recent rated movie to see if the reccs need to be updated
        Will return True if we need to update the reccomendations
        """
        print(f"Recommendations stored for user {user_id}, checking to see if they're up to date.")
        reccs_updated = datetime.datetime.fromisoformat(encoded_reccs['updatedAt'])
        
        # Getting rated movies
        recent_movie, error = await self.most_recent_rated_movie(user_id)
        if error:
            print(f"Error {error} attempting to get rated movies")
            return None, RecommendationException
        encoded_recent = JSONEncoder().encode(recent_movie[0])
        encoded_recent = json.loads(encoded_recent)
        recent_updated = datetime.datetime.fromisoformat(encoded_recent['updatedAt'])
        if reccs_updated < recent_updated:
            return True, None
        else:
            return False, None
                
    async def gather_reccs_data(self, user_id: str):
        print("Attempting to gather all recommendation data...")
        rated_movies, error = await self.query_mongo_for_user(user_id, 'rated_movies')
        if error:
            print("Error attempting to get rated movies")
            return None, RecommendationException
        keywords = []
        for item in rated_movies:
            keywords.append(item['keywords'])
        directors, genres, keywords = self.extract_details_for_discover(rated_movies)
        
        discover_directors = []
        for direc in directors:
            disc_direc, error = await self.tmdb_client.make_discover_request(type='director', unique_id=direc[0])
            if error:
                print("Error attempting to get query discover")
                return None, RecommendationException
            discover_directors.extend(disc_direc['results'])
        discover_genres = []
        for gen in genres:
            disc_direc, error = await self.tmdb_client.make_discover_request(type='genre', unique_id=gen[0])
            if error:
                print("Error attempting to get query discover")
                return None, RecommendationException
            discover_genres.extend(disc_direc['results'])
        
        discover_keywords = []
        for keyword in keywords:
            disc_direc, error = await self.tmdb_client.make_discover_request(type='keywords', unique_id=keyword[0])
            if error:
                print("Error attempting to get query discover")
                return None, RecommendationException
            discover_keywords.extend(disc_direc['results'])
            
        top_movies = self.get_top_rated_movies(rated_movies)
        similar_movie_collection = []
        for movie in top_movies:
            similar_movies, error = await self.tmdb_client.make_movie_request(path='similar', movie_id=movie['movie_id'])
            if error:
                print("Error attempting to get similar movies")
                return None, RecommendationException
            similar_movie_collection.extend(similar_movies['results'])

        recommended_movie_collection = []
        for movie in top_movies:
            recommended_movies, error = await self.tmdb_client.make_movie_request(path='recommendations', movie_id=movie['movie_id'])
            if error:
                print("Error attempting to get recommended movies")
                return None, RecommendationException
            recommended_movie_collection.extend(recommended_movies['results'])
            
        
        full_response = {'discover_directors': discover_directors, 'discover_genres': discover_genres,
                         'discover_keywords': discover_keywords,
                         'similar_movies': similar_movie_collection,
                         'recommeded_movies': recommended_movie_collection,
                         'rated_movies': rated_movies,
                         'directors': directors,
                         'genres': genres}
            
        
        return JSONEncoder().encode(full_response), error
    
    def get_top_rated_movies(self, rated_movie: dict):
        """
        Get the top rated movies for the given user
        """
        movie_list = []
        for movie in rated_movie:
            if movie['rating'] > 6:
                simple_movie = {'movie_id': movie['movie_id'], 'rating': movie['rating']}
                movie_list.append(simple_movie)

        ordered_movies = sorted(movie_list, key=lambda i: i['rating'], reverse=True)

        # Returns 20 highest rated movies
        return ordered_movies[0:19]
    
    def extract_details_for_discover(self, rated_movie: dict):
        """
        Function to get relevant details from my existing rated movies for discover query
        """
        
        genres = []
        directors = []
        keywords = []
        for item in rated_movie:
            genres.append(item['genres'])
            directors.append(item['director'])
            keywords.append(item['keywords'])

        direc_counts = Counter(directors)
        most_common_direcs = direc_counts.most_common(6)

        list_of_g_ids = []
        for genre in genres:
            genre_string = ''
            for item in genre:
                genre_string += str(item['id'])
                if item != genre[-1]:
                    genre_string += ','
            list_of_g_ids.append(genre_string)

        genre_counts = Counter(list_of_g_ids)
        
        list_of_keyword_sets = []
        for keyword_set in keywords:
            for keyword in keyword_set:
                list_of_keyword_sets.append(keyword['id'])

        keyword_counts = Counter(list_of_keyword_sets)
        
        most_common_genres = genre_counts.most_common(6)
        most_common_keywords = keyword_counts.most_common(6)

        return most_common_direcs, most_common_genres, most_common_keywords
    
    async def query_mongo_for_user(self, user_id, collection):
        """
        Function to get info from a given collection from a given user
        """
        try:
            query = self.movies_query_build(user_id)
            rated_movies, error = await self.mongo_client.make_request(collection=collection, query=query)
        except Exception as err:
            print(f"Error: {err} when attempting to get query Mongo for collection: {collection}")
            return None, err
        
        return rated_movies, error
    
    async def most_recent_rated_movie(self, user_id):
        """
        Function to query mongo to get the most recent rated movie
        """
        try:
            query = self.recent_movie_query(user_id)
            rated_movies, error = await self.mongo_client.make_request(collection='rated_movies', query=query)
        except Exception as err:
            print(f"Error: {err} when attempting to get query Mongo for collection: rated_mvoies")
            return None, err
        
        return rated_movies, error
    
    def recent_movie_query(self, user_id) -> list:
        """
        Function to build out the query to get most recent rated movie
        """
        
        pipeline = [
            {
                "$match": {
                    "user_id": user_id
                }
            },
            {
                "$sort": {
                    "updatedAt": -1
                }
            }
        ]
        
        return pipeline
    
    def movies_query_build(self, user_id) -> list:
        """
        Function to build out the query to get rated movies
        """
        
        pipeline = [
            {
                "$match": {
                    "user_id": user_id
                } 
            }
        ]
        
        return pipeline