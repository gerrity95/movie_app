const express = require('express');
const router = express.Router();
const path = require('path');
const rater = require("../../models/rated_movies")
const passport = require("passport");
const passportLocalMongoose = require("passport-local-mongoose");
const dotenv = require('dotenv');
const async = require("async");
const http = require('http');
dotenv.config();

const {
  FLASK_HOST,
  FLASK_PORT
} = process.env;


async function flask_test() {
  var request_data = {"Hello": "Mark"}
  var options = {
    host: `${FLASK_HOST}`,
    path: '/param_test',
    port: `${FLASK_PORT}`,
    method: 'POST',
    headers: {
      "content-type": "application/json"
    }
  };
  
  var body = ""
  return new Promise((resolve, reject) => {
    const req = http.request(options, (res) => {
      console.log("Request made to Flask API.");
      console.log('statusCode:', res.statusCode);
      console.log('headers:', res.headers);
    
      res.on('data', (chunk) => {
        body += chunk;
      });
      res.on('end', () => {
        try {
          response_body = JSON.parse(body);
          resolve({"status": res.statusCode, "body": response_body});
        } catch (error) {
          console.log("Error: " + error + " attempting to parse response from FLASK API.")
          resolve({"status": res.statusCode, "body": body});
        }
      })
    });
    
    req.on('error', (e) => {
      console.error("Error queryinwg Flask Server: " + e);
      reject(e)
    });
    
    req.write(JSON.stringify(request_data))
    req.end();
  });
}

async function get_reccomendations(user_id) {
  var request_data = {"user_id": user_id}
  var options = {
    host: `${FLASK_HOST}`,
    path: '/get_reccomendations',
    port: `${FLASK_PORT}`,
    method: 'POST',
    headers: {
      "content-type": "application/json"
    }
  };
  console.log("Processing request against backend...");
  var body = ""
  return new Promise((resolve, reject) => {
    const req = http.request(options, (res) => {
      console.log("Request made to Flask API.");
      console.log('statusCode:', res.statusCode);
      console.log('headers:', res.headers);
    
      res.on('data', (chunk) => {
        body += chunk;
      });
      res.on('end', () => {
        try {
          response_body = JSON.parse(body);
          resolve({"status": res.statusCode, "body": response_body});
        } catch (error) {
          console.log("Error: " + error + " attempting to parse response from FLASK API.")
          resolve({"status": res.statusCode, "body": body});
        }
      })
    });
    
    req.on('error', (e) => {
      console.error("Error querying Flask Server: " + e);
      reject(e)
    });
    
    req.write(JSON.stringify(request_data))
    req.end();
  });
}

function sample_movies() {
  return {
        "status": 200,
        "body": {
            "result": [
              {
                  "movie_id": 106646,
                  "movie_info": {
                      "adult": false,
                      "backdrop_path": "/cWUOv3H7YFwvKeaQhoAQTLLpo9Z.jpg",
                      "genre_ids": [
                          80,
                          18,
                          35
                      ],
                      "id": 106646,
                      "original_language": "en",
                      "original_title": "The Wolf of Wall Street",
                      "overview": "A New York stockbroker refuses to cooperate in a large securities fraud case involving corruption on Wall Street, corporate banking world and mob infiltration. Based on Jordan Belfort's autobiography.",
                      "popularity": 130.806,
                      "poster_path": "/pWHf4khOloNVfCxscsXFj3jj6gP.jpg",
                      "release_date": "2013-12-25",
                      "title": "The Wolf of Wall Street",
                      "video": false,
                      "vote_average": 8,
                      "vote_count": 18447
                  },
                  "weight": 18
              },
              {
                  "movie_id": 274,
                  "movie_info": {
                      "adult": false,
                      "backdrop_path": "/mfwq2nMBzArzQ7Y9RKE8SKeeTkg.jpg",
                      "genre_ids": [
                          80,
                          18,
                          53,
                          27
                      ],
                      "id": 274,
                      "original_language": "en",
                      "original_title": "The Silence of the Lambs",
                      "overview": "Clarice Starling is a top student at the FBI's training academy. Jack Crawford wants Clarice to interview Dr. Hannibal Lecter, a brilliant psychiatrist who is also a violent psychopath, serving life behind bars for various acts of murder and cannibalism. Crawford believes that Lecter may have insight into a case and that Starling, as an attractive young woman, may be just the bait to draw him out.",
                      "popularity": 11.473,
                      "poster_path": "/rplLJ2hPcOQmkFhTqUte0MkEaO2.jpg",
                      "release_date": "1991-02-01",
                      "title": "The Silence of the Lambs",
                      "video": false,
                      "vote_average": 8.3,
                      "vote_count": 12474
                  },
                  "weight": 17.3
              },
              {
                  "movie_id": 111,
                  "movie_info": {
                      "adult": false,
                      "backdrop_path": "/cCvp5Sni75agCtyJkNOMapORUQV.jpg",
                      "genre_ids": [
                          28,
                          80,
                          18,
                          53
                      ],
                      "id": 111,
                      "original_language": "en",
                      "original_title": "Scarface",
                      "overview": "After getting a green card in exchange for assassinating a Cuban government official, Tony Montana stakes a claim on the drug trade in Miami. Viciously murdering anyone who stands in his way, Tony eventually becomes the biggest drug lord in the state, controlling nearly all the cocaine that comes through Miami. But increased pressure from the police, wars with Colombian drug cartels and his own drug-fueled paranoia serve to fuel the flames of his eventual downfall.",
                      "popularity": 42.223,
                      "poster_path": "/iQ5ztdjvteGeboxtmRdXEChJOHh.jpg",
                      "release_date": "1983-12-09",
                      "title": "Scarface",
                      "video": false,
                      "vote_average": 8.2,
                      "vote_count": 8650
                  },
                  "weight": 17.2
              },
              {
                  "movie_id": 238,
                  "movie_info": {
                      "adult": false,
                      "backdrop_path": "/rSPw7tgCH9c6NqICZef4kZjFOQ5.jpg",
                      "genre_ids": [
                          18,
                          80
                      ],
                      "id": 238,
                      "original_language": "en",
                      "original_title": "The Godfather",
                      "overview": "Spanning the years 1945 to 1955, a chronicle of the fictional Italian-American Corleone crime family. When organized crime family patriarch, Vito Corleone barely survives an attempt on his life, his youngest son, Michael steps in to take care of the would-be killers, launching a campaign of bloody revenge.",
                      "popularity": 61.648,
                      "poster_path": "/eEslKSwcqmiNS6va24Pbxf2UKmJ.jpg",
                      "release_date": "1972-03-14",
                      "title": "The Godfather",
                      "video": false,
                      "vote_average": 8.7,
                      "vote_count": 14928
                  },
                  "weight": 16.7
              }]
      }
    }
}

module.exports = {
  flask_test: flask_test,
  get_reccomendations: get_reccomendations,
  sample_movies: sample_movies
};