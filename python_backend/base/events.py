from uuid import uuid4
import datetime
import pickle

class RecommendationsEvent:

    @classmethod
    def event_type(cls) -> str:
        return cls.__name__

    def __init__(self):
        self.uuid = str(uuid4())
        self.parent_uuid = self.uuid
        self.timestamp = datetime.datetime.now()
        self.reccomendations = []
        self.routing_key = 'recommendations_queue'
        self.result_routing_key = str(self.routing_key + '_' + self.uuid)
        
    def serialize(self):
        """Convert a RecommendationsEvent to bytes so we can pass it through RMQ"""
        return pickle.dumps(self)
    
    def deserialize(self):
        """Convert a bytes version of RecommendationsEvent to an Object"""
        return pickle.loads(self)