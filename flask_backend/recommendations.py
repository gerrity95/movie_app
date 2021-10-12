import asyncio
from base.mongoclient import MongoClient
from base.tmdbclient import TmdbClient

class Recommendations:
    
    def __init__(self) -> None:
        self.mongo_client = MongoClient()
        self.tmdb_client = TmdbClient()
        
    async def get_similar_movies(self):
        result, error = await self.tmdb_client.make_movie_request(path='similar', movie_id=769)
        
        return result, error
    
    async def get_rated_movies(self, user_id):
        """
        Function to get all rated movies for a given user 
        """
        try:
            query = self.rated_movies_query_build(user_id)
            rated_movies = await self.mongo_client.make_request(collection='rated_movies', query=query)
        except Exception as err:
            print(f"Error: {err} when attempting to get rated movies")
            return None, err
        
        return rated_movies, None
    
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