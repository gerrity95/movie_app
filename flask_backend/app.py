import os
import asyncio
from flask import Flask, jsonify

from base.tmdbclient import TmdbClient
app = Flask(__name__)
from base.mongoclient import MongoClient
from recommendations import Recommendations
from dotenv import load_dotenv
from pathlib import Path

#we define the route /
@app.route('/')
def welcome():
    # return a json
    return jsonify({'status': 'api is working'})

#we define the route /
@app.route('/mongo_ping')
async def mongo_test():
    ping_result = await MongoClient().ping()
    # return a json
    return jsonify({'status': ping_result})

#we define the route /
@app.route('/tmdb_ping')
async def tmdb_test():
    ping_result = await TmdbClient().ping()
    # return a json
    return jsonify({'status': ping_result})


#we define the route /
@app.route('/get_reccomendations')
async def get_reccs():
    result, error = await Recommendations().calculate_reccs(user_id='615d66a4919768001afad6af')
    # return a json
    if error:
        return {'status': str(error)}
    
    return result


if __name__ == '__main__':
    #define the localhost ip and the cport that is going to be used
    # in some future article, we are going to use an env variable instead a hardcoded port 
    app.run(host='0.0.0.0', port=os.getenv('PORT'))
