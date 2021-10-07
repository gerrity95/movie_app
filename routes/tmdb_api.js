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
    console.log("Submitted rating: " + req.body.rating);
    console.log("Attempting to get show details for: " + req.body.show_id);
    try {
      var show_details = await get_tvshow_details(req.body.show_id);
      if (show_details.status != 200) {
        console.log("Unable to fulfill request to add show to DB.");
        return res.json({'user': req.user, 'response': show_details}); 
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
        show_id: req.body.show_id,
        genres: show_details.body.genres,
        languages: show_details.body.languages,
        tmdb_rating: show_details.body.vote_average,
        networks: show_details.body.networks,
        creator: show_details.body.creator});

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



module.exports = router;