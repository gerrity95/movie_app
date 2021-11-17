import asyncio
from base.mongoclient import MongoClient
from base.tmdbclient import TmdbClient
from base.recc_calculator import ReccCalculator
import json
import datetime
from base.recommendations_helper import RecommendationException, JSONEncoder, RecommendationsHelper
from bson import ObjectId


class Recommendations:
    
    def __init__(self) -> None:
        self.mongo_client = MongoClient()
        self.tmdb_client = TmdbClient()
        self.recc_calculator = ReccCalculator()
        self.recc_helper = RecommendationsHelper()
        
    async def calculate_reccs(self, user_id: str):
        """
        """
        # Check for existing recommendations
        stored_reccs, error = await self.recc_helper.query_mongo_for_user(user_id, 'recommended_movies')
        if error:
            print(f"Error {error} attempting to get reccommended movies")
            return None, RecommendationException
        if stored_reccs:
            try:
                # TODO CHECK FOR STATE HERE IF ITS IN PROGRESS
                """
                EDGE CASE, user rates movie, goes to in progress, rates another movie before first movie finishes processing. Do we generate them again?
                """
                print("Checking if we are currently updating the recommendations for user: " + user_id)
                if stored_reccs[0]['state'] == 'in_progress':
                    counter = 0
                    while counter < 5:
                        print("Currently in the process of updating the recommendations. Will retry in 5 seconds to check if complete... ")
                        await asyncio.sleep(5)
                        stored_reccs, error = await self.recc_helper.query_mongo_for_user(user_id, 'recommended_movies')
                        if error:
                            print(f"Error {error} attempting to get reccommended movies ")
                            return None, RecommendationException

                        if stored_reccs[0]['state'] == 'in_progress':
                            counter += 1
                        else:
                            # No need to generate them again so can just return. Want to wait until process is complete.
                            print("Recommendations have been updated as part of another process. Returning. ")
                            return stored_reccs[0]['recommendations'], None

                encoded_reccs = JSONEncoder().encode(stored_reccs[0])
                encoded_reccs = json.loads(encoded_reccs)
                # Check against rated movies to see if we need to update the recommendations
                print("Comparing recommendations against existing ratings... ")
                need_new_reccs, error = await self.compare_reccs_with_rated(user_id=user_id, encoded_reccs=encoded_reccs)
                if error:
                    print(f"Error {error} seen attempting to compare recommendations with rated movies ")
                    return None, RecommendationException    
            except Exception as e:
                print(f"Error {e} seen attempting to compare recommendations with rated movies ")
                return None, RecommendationException
        else:
            print("No recommendations have been generated. Atetmpting to populate now.... ")
            recommendations, error = await self.process_recommendations(user_id=user_id, is_new=True)
            return recommendations, error
        
        if need_new_reccs:
            print(f"Recommendations have expired for user {user_id}. Attempting to update... ")
            recommendations, error = await self.process_recommendations(user_id=user_id, is_new=False, existing_reccs_id=stored_reccs[0]['_id'])
            return recommendations, error
        else:
            print(f"Recommendations are up to date for user {user_id}. Will not attempt to update ")
            return encoded_reccs['recommendations'], None

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