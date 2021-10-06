const express = require('express');
const router = express.Router();
const path = require('path');
const rater = require("../models/rated_tvshows")
const passport = require("passport");
const passportLocalMongoose = require("passport-local-mongoose");
const dotenv = require('dotenv');
const async = require("async");
const https = require('https');
dotenv.config();

const {
    TMDB_API,
    TMDB_READ_TOKEN
  } = process.env;


router.post("/user/submit_rating", async (req, res, next) => {
  //var url = req.get('referer').split('?')[0];
  if (req.user) {
    console.log("User logged in");
    console.log("Submmited Movie ID: " + req.body.show_id);
    console.log("Submitted rating: " + req.body.rating);
    var show_details = await get_tvshow_details(req.body.show_id);
    return res.json({'user': req.user, 'response': show_details})
  }
  else
  {
    console.log("No user present")
    return res.json({'user': false});
  }
 
})

async function get_tvshow_details(show_id) {
  var options = {
    host: 'api.themoviedb.org',
    path: '/3/tv/' + show_id,
    port: 443,
    method: 'GET',
    headers: {'Authorization': 'Bearer ' + TMDB_READ_TOKEN}
  };
  
  var body = ""
  return new Promise((resolve, reject) => {
    const req = https.request(options, (res) => {
      console.log('statusCode:', res.statusCode);
      console.log('headers:', res.headers);
    
      res.on('data', (chunk) => {
        body += chunk;
      });
      res.on('end', () => {
        response_body = JSON.parse(body);
        resolve(response_body);
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