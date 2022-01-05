from motor.core import AgnosticDatabase, AgnosticCollection
from motor.motor_asyncio import AsyncIOMotorClient
from env_config import Config

class MongoClient():
    """
    A generic mongo client
    """

    def __init__(self) -> None:
        self.config = Config()
        self.endpoint = self.config.MONGO_HOSTNAME
        self.port = self.config.MONGO_PORT
        self.user = self.config.MONGO_USERNAME
        self.password = self.config.MONGO_PASSWORD
        self.client = AsyncIOMotorClient(f'mongodb://{self.user}:{self.password}@{self.endpoint}:{self.port}')

    def node_db(self) -> AgnosticDatabase:
        return self.client.nodejs_db

    def rated_collection(self) -> AgnosticCollection:
        return self.client.nodejs_db.rated_movies
    
    def recommended_collection(self) -> AgnosticCollection:
        return self.client.nodejs_db.recommended_movies

    async def ping(self) -> bool:
        try:
            await self.node_db().list_collection_names()
            return True
        except Exception as error:
            print(f"Error talking to Mongo: {error}")
            return False
        
    async def make_request(self, query: list, collection: str, database: str = 'nodejs_db'):
        """
        Function to make request against Mongo Collection
        """
        result = []
        try:
            db: AgnosticDatabase = getattr(self.client, database)
            events: AgnosticCollection = getattr(db, collection)
            async for doc in events.aggregate(query):
                result.append(doc)
            print("Successfully got a response from Mongo. Processing")
            return result, None
        except Exception as error:
            print(f"Error attempting to make request against mongo: {error}")
            return None, error