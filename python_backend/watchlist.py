import asyncio
from base.mongoclient import MongoClient
from base.tmdbclient import TmdbClient
from base.rabbitmq_client import RabbitMqClient
import json
import datetime

class Watchlist:
    
    def __init__(self) -> None:
        self.mongo_client = MongoClient()
        self.tmdb_client = TmdbClient()
        self.rabbitmq_client = RabbitMqClient()
    
    async def process_watchlist(self, movie_list: list) -> list:
        """
        Function to get all data for all movies in a given users watchlist
        """
        print("Attempting to process watchlist...")
        print(movie_list)
        
        return [], None