import os
import asyncio
from flask import Flask, jsonify
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
@app.route('/mongo_test')
async def mongo_test():
    ping_result = await MongoClient().ping_mongo()
    # return a json
    return jsonify({'status': ping_result})

#we define the route /
@app.route('/get_reccomendations')
async def get_reccs():
    result, error = await Recommendations().get_rated_movies('615d66a4919768001afad6af')
    # return a json
    if error:
        return {'status': str(error)}
    
    return {'status': str(result)}

if __name__ == '__main__':
    #define the localhost ip and the cport that is going to be used
    # in some future article, we are going to use an env variable instead a hardcoded port 
    app.run(host='0.0.0.0', port=os.getenv('PORT'))
