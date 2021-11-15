from logging import fatal
import os
import asyncio
from flask import Flask, jsonify, request

from base.tmdbclient import TmdbClient
app = Flask(__name__)
from base.mongoclient import MongoClient
from base.rabbitmq_client import RabbitMqClient
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
@app.route('/rmq_ping')
async def rmq_test():
    ping_result = await RabbitMqClient().main()
    # return a json
    return jsonify({'status': True})


#we define the route /
@app.route('/get_reccomendations', methods=['GET', 'POST'])
async def get_reccs():
    print("Request received to get recommendations...")
    user_id = request.json.get('user_id')
    if user_id:
            result, error = await Recommendations().calculate_reccs(user_id=user_id)
            # return a json
            if error:
                return {'status': str(error)}
            
            return {'result': result}

    else:
        return jsonify({'status': False})


if __name__ == '__main__':
    #define the localhost ip andd the cport that is going to be used
    # in some future article, we are going to use an env variable instead a hardcoded port
    app.run(host='0.0.0.0', port=os.getenv('PORT')) 