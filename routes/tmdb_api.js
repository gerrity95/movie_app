const express = require('express');
const router = express.Router();
const path = require('path');
const rater = require("../models/rated_movies")
const passport = require("passport");
const passportLocalMongoose = require("passport-local-mongoose");
const dotenv = require('dotenv');
const async = require("async");
const https = require('https');
const flask_api = require('./helpers/flask_api');
const { response } = require('express');
dotenv.config();

const {
    TMDB_API,
    TMDB_READ_TOKEN
  } = process.env;


router.post("/user/submit_rating", async (req, res, next) => {
  //var url = req.get('referer').split('?')[0];
  if (req.user) {
    console.log("Submitted rating: " + req.body.rating);
    console.log("Attempting to get movie details for: " + req.body.movie_id);
    try {
      var movie_details = await get_movie_details(req.body.movie_id);
      if (movie_details.status != 200) {
        console.log("Unable to fulfill request to add movie to DB.");
        return res.json({'user': req.user, 'response': movie_details}); 
      };

      var movie_cast = await generic_tmdb_query(req.body.movie_id, 'credits');
      director_id = "";
      for (var member in movie_cast.body.cast) {
        if (movie_cast.body.crew[member]['job'] == 'Director') {
          console.log(movie_cast.body.crew[member]);
          director_id = movie_cast.body.crew[member].id;
          break;
        }
      }
      var movie_keywords = await generic_tmdb_query(req.body.movie_id, 'keywords');
      if (movie_keywords.status != 200) {
        console.log("Unable to fulfill request to add movie to DB.");
        return res.json({'user': req.user, 'response': movie_details}); 
      };

    } catch (e) {
      console.log("Error attempting to talk to TMDB. Error: ");
      console.log(e)
      return res.json({'user': req.user, 'response': false});
    }
    try {
      console.log("Attempting to add show to DB...")
      const new_show = new rater({
        user_id: req.user._id, 
        rating: req.body.rating,
        movie_id: req.body.movie_id,
        genres: movie_details.body.genres,
        languages: movie_details.body.original_language,
        tmdb_rating: movie_details.body.vote_average,
        production_companies: movie_details.body.production_companies,
        director: director_id,
        keywords: movie_keywords.body.results
      });

      let add_show = await rater.create(new_show);
      
      console.log(add_show);
      return res.json({'user': req.user, 'response': add_show});
    } catch (e) {
      console.log("Error attempting to add show to the DB.")
      console.log("Error: " + e)
      return res.json({'response': 'bad'});
    }
  }
  else
  {
    console.log("No user currently logged in. Cannot fulfil request...")
    return res.json({'user': false});
  }
 
});

router.get('/user/recommended_shows', async (req, res, next) => {

  shows = await flask_api.flask_test()
  console.log("GOT A RESULT FROM FLASK");

  return res.json({"result": shows});

});

async function get_movie_details(movie_id) {
  var options = {
    host: 'api.themoviedb.org',
    path: '/3/movie/' + movie_id,
    port: 443,
    method: 'GET',
    headers: {'Authorization': 'Bearer ' + TMDB_READ_TOKEN}
  };
  
  var body = ""
  return new Promise((resolve, reject) => {
    const req = https.request(options, (res) => {
      console.log("Request made to TMDB");
      console.log('statusCode:', res.statusCode);
      console.log('headers:', res.headers);
    
      res.on('data', (chunk) => {
        body += chunk;
      });
      res.on('end', () => {
        response_body = JSON.parse(body);
        resolve({"status": res.statusCode, "body": response_body});
      })
    });
    
    req.on('error', (e) => {
      console.error("Error querying TMDB: " + e);
      reject(e)
    });
    
    req.end();
  });
}

async function generic_tmdb_query(movie_id, query_path) {
  var options = {
    host: 'api.themoviedb.org',
    path: '/3/movie/' + movie_id + '/' + query_path,
    port: 443,
    method: 'GET',
    headers: {'Authorization': 'Bearer ' + TMDB_READ_TOKEN}
  };
  
  var body = ""
  return new Promise((resolve, reject) => {
    const req = https.request(options, (res) => {
      console.log("Request made to TMDB to get Keywords");
      console.log('statusCode:', res.statusCode);
      console.log('headers:', res.headers);
    
      res.on('data', (chunk) => {
        body += chunk;
      });
      res.on('end', () => {
        response_body = JSON.parse(body);
        resolve({"status": res.statusCode, "body": response_body});
      })
    });
    
    req.on('error', (e) => {
      console.error("Error querying TMDB: " + e);
      reject(e)
    });
    
    req.end();
  });
}



module.exports = router;