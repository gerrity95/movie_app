import requests
import json
import os
from urllib.parse import quote
from dotenv import load_dotenv
from pathlib import Path


class TmdbClient():
    """
    A generic tmdb client
    """

    def __init__(self) -> None:
        ROOT_DIR = os.path.dirname(os.path.abspath(__file__))
        dotenv_path = Path(os.path.join(ROOT_DIR, '.env'))
        load_dotenv(dotenv_path=dotenv_path)
        self.api_key = os.getenv('TMDB_API')
        self.read_token = os.getenv('TMDB_READ_TOKEN')
        self.api_endpoint = 'https://api.themoviedb.org/3/'

    async def ping(self) -> bool:
        try:
            headers = {
                    'Authorization': f"Bearer {self.read_token}"
                }
            requests.get(url=f"{self.api_endpoint}/account", headers=headers)
            return True
        except Exception as error:
            print(f"Error talking to TMDB: {error}")
            return False
        
    async def make_movie_request(self, path: str, movie_id: int):
        """
        Function to make request against TMDB API
        """
        try:
            headers = {
                    'Authorization': f"Bearer {self.read_token}"
                }
            result = requests.get(url=f"{self.api_endpoint}/movie/{movie_id}/{path}",
                                  headers=headers)
        except Exception as error:
            print(f"Error attempting to make request against tmdb: {error}")
            return None, error
        
        if result.status_code == 200:
            print("Successfully got a response from generic movie endpoint...")
            try:
                return result.json(), None
            except json.decoder.JSONDecodeError as err:
                print("Error with the response returned TMDB. Cleaning up")
                return None, err
        else:
            print(f"Unexpected response from TMDB. Status: {result.status_code}, content: {result.content}")
            return None, Exception
        
    async def make_discover_request(self, type: str, unique_id: str):
        """
        Function to make request against TMDB discover API
        """
        try:
            params = {
                'sort_by': 'vote_average.desc',
                'vote_count.gte': 1000,
                'with_original_language': 'en',
                'page': '1',
                
            }
            if type == 'director':
                params['with_crew'] = unique_id
            elif type == 'genre':
                params['with_genres'] = unique_id
            else:
                params['with_keywords'] = unique_id
                
            headers = {
                    'Authorization': f"Bearer {self.read_token}"
                }
            result = requests.get(url=f"{self.api_endpoint}/discover/movie/",
                                headers=headers, params=params)
        except Exception as error:
            print(f"Error attempting to make request against tmdb: {error}")
            return None, error
        
        if result.status_code == 200:
            print("Successfully got a response from discover endpoint...")
            try:
                return result.json(), None
            except json.decoder.JSONDecodeError as err:
                print("Error with the response returned TMDB. Cleaning up")
                return None, err
        else:
            print(f"Unexpected response from TMDB. Status: {result.status_code}, content: {result.content}")
            return None, Exception
