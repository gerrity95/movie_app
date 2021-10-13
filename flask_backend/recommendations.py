import asyncio
from base.mongoclient import MongoClient
from base.tmdbclient import TmdbClient
from collections import Counter
import json
from bson import ObjectId

class JSONEncoder(json.JSONEncoder):
    def default(self, o):
        if isinstance(o, ObjectId):
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
        
    async def calculate_reccs(self, user_id: str):
        rated_movies, error = await self.get_rated_movies(user_id)
        if error:
            print("Error attempting to get rated movies")
            return None, RecommendationException
        directors, genres = self.extract_details_for_discover(rated_movies)
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
            if movie['rating'] > 3:
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
        for item in rated_movie:
            genres.append(item['genres'])
            directors.append(item['director'])
            # TODO KEYWORDS

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
        most_common_genres = genre_counts.most_common(6)

        return most_common_direcs, most_common_genres
    
    async def get_rated_movies(self, user_id):
        """
        Function to get all rated movies for a given user 
        """
        try:
            query = self.rated_movies_query_build(user_id)
            rated_movies, error = await self.mongo_client.make_request(collection='rated_movies', query=query)
        except Exception as err:
            print(f"Error: {err} when attempting to get rated movies")
            return None, err
        
        return rated_movies, error
    
    def rated_movies_query_build(self, user_id) -> list:
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