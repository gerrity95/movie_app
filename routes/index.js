const express = require('express');
const router = express.Router();
const path = require('path');
const User = require("../models/user");
const watch_provider = require("../models/watch_providers");
const passport = require("passport");
const passportLocalMongoose = require("passport-local-mongoose");
const flask_api = require('./helpers/flask_api');
const helpers = require('./helpers/generic_helpers');
const reccs_model = require('../models/recommended_movies')
const rated_model = require('../models/rated_movies');
const email = require('../config/email');
const tmdb_api = require('./tmdb_api');
const { watch } = require('../models/rated_movies');
const watch_providers = require('../models/watch_providers');

router.use (function (req, res, next) {
  console.log('/' + req.method);
  next();
});

router.get("/", (req,res) =>{
  var user_info = helpers.existing_session(req);
  res.render("home", {user_info: user_info});
})

router.get("/about", (req,res) =>{
  var user_info = helpers.existing_session(req);
  res.render("about", {user_info: user_info});
})

router.get("/userprofile", helpers.is_logged_in, async (req,res) =>{
  console.log("Checking to ensure enough reviews have been processed for the user: " + req.user._id)
  var rated_movies = await rated_model.find({
    user_id: req.user._id
  })
  if (rated_movies.length < 5) {
    console.log("Not enough movies have been rated by user: " + req.user._id)
    return res.redirect('/welcome')
  }
  console.log("Attempting to get movie data...");
  console.log("Getting genre list..");
  var genres = await tmdb_api.get_genres(); 
  console.log(genres.body.genres);
  console.log("Getting shows...");
  var shows = await flask_api.get_reccomendations(req.user._id)
  //showss = flask_api.sample_movies()
  console.log(shows)
  if (shows.status == 200) {
    res.render("user_profile", {user_info: req.user, movie_info: shows.body.result, genres: genres.body.genres});
  }
  else {
    res.render("user_profile", {user_info: req.user, movie_info: 'Bad', genres: genres.body.genres});
  }

})

router.get("/user/userprofile", async (req,res) =>{

  if (req.user) {
    console.log("AJAX request made to get user profile...")
    console.log("Checking to ensure enough reviews have been processed for user: " + req.user._id)
    var rated_movies = await rated_model.find({
      user_id: req.user._id
    })
    if (rated_movies.length < 5) {
      console.log("Not enough movies have been rated by user: " + req.user._id)
      return res.json({'success': false, 'movies_rated': false, 'movie_count': rated_movies.length})
    }
    console.log("Attempting to get movie data...");
    shows = await flask_api.get_reccomendations(req.user._id)
    //shows = flask_api.sample_movies()
    if (shows.status == 200) {
      return res.json({'success': true, 'movies_rated': true})
    }
    else {
      return res.json({'success': false, 'movies_rated': true})
    }
  
  }

})

router.get("/welcome", helpers.is_logged_in, async (req,res) =>{
  console.log("Attempting to render welcome page...");
  var rated_movies = await rated_model.find({
    user_id: req.user._id
  });
  if (rated_movies.length > 5) {
    console.log("Too many movies have been rated by user: " + req.user._id)
    return res.redirect('/userprofile')
  }
  const rndInt = helpers.random_number(1, 8)
  inspire_query = 'language=en-US&sort_by=popularity.desc&include_adult=false&include_video=false&page=' + rndInt + '&vote_average.gte=8&with_original_language=en&vote_count.gte=1000';
  var inspiration_movies = await tmdb_api.discover_search(inspire_query);
  var inspiry_list = false;
  if (inspiration_movies.status == 200) {
    inspiry_list = inspiration_movies.body.results;
  }

  return res.render("welcome", {user_info: req.user, movie_info: 'Bad', 'movie_count': rated_movies.length, inspire_movies: inspiry_list});
  
})

//Auth Routes
router.get("/login",(req,res)=>{
  var user_info = helpers.existing_session(req);
  res.render("login", {user_info: user_info});
});

router.post('/login', function(req, res, next) {
  passport.authenticate('local', function(err, user, info) {
    var url = req.get('referer').split('?')[0];
    console.log("Attempted login from: " + url);
    if (err) {
      console.log("Error: " + err + " when attempting to login");
      return res.redirect(url + "?failed_login=True");
    }

    if (!user) {

      console.log("Authentication problem. Email/Password is incorrect");
      return res.redirect(url + "?failed_login=True");
    }

    req.logIn(user, function(err) {
         if (err) { return next(err); }
         console.log("Successfully logged in for user: " + req.user.email);
         return res.redirect('/userprofile')
       });

     })(req, res, next);

   });

/*
router.post('/api/login', function(req, res, next) {
  passport.authenticate('local', function(err, user, info) {

    if (err) {
      console.log("Error: " + err + " when attempting to login");
      return next(err);
    }

    if (!user) {

      console.log("Authentication problem. Email/Password is incorrect");
      return res.json({'error': true});
    }

    req.logIn(user, function(err) {
         if (err) { return next(err); }
         console.log("Successfully logged in for user: " + req.user.email);
         console.log(res)
         return res.json({'success': true});
       });

     })(req, res, next);

   });

router.get("/api/test", helpers.is_logged_in, (req,res) =>{
  console.log("User is logged in");
  res.json({user_info: req.user});
  })

router.get("/api/test_register", (req,res) =>{
  console.log("Testing register");
  var is_valid_pword = isValidPassword(req.body.password);
  console.log(is_valid_pword);
  if (is_valid_pword !== true) {
    console.log("Password does not meet requirements.");
    return res.json({'result': is_valid_pword});
  }
  return res.json({'result': true});
});

*/

router.get("/register",(req,res)=>{
  var user_info = helpers.existing_session(req);
  res.render("register", {user_info: user_info});
});

router.post("/register", async (req,res)=>{
  var url = req.get('referer').split('?')[0];
  var is_valid_pword = helpers.is_valid_password(req.body.password);

  if (is_valid_pword !== true) {
    console.log("Password does not meet requirements.");
    return res.render("register", {fail_message: is_valid_pword})
  }
    
  await User.register(new User({
    username: req.body.username, 
    email: req.body.email,
    first_name: req.body.first_name,
    last_name: req.body.last_name}),
    req.body.password, async function(err,user){
      if(err){
        console.log(err.name)
        if (err.name == 'UserExistsError') {
          console.log("Cannot create user as they already exist.");
          return res.redirect(url + "?user_exists=True");
        }
        else if (err.name == 'MongoServerError') {
          if (err.message.includes("E11000 duplicate key error")) {
            console.log("Cannot create user as they already exist.");
            return res.redirect(url + "?email_exists=True");
          }
        }  
        console.log("Unknown error when attempting to register")
        console.log(err);
        return res.redirect(url + "?error=True");
      }
    console.log('Successfully created user: ' + user.email);
    html_message = `
    <center><img style="width:300px;height:168px" src="https://whattowatchmovies.co/images/what_to_watch_black.png"></center><br><br>
    Dear ${req.body.first_name} ${req.body.last_name},<br><br><p>Welcome to What To Watch! This is the only place you'll need to go to find out what movies you'll love. 
    Once you login you'll be asked to rate some movies to get started so we can get a baseline on exactly what you like to watch. It should only take a minute or so as we only need 5 movies to get started!</p><br>
    <p>If you would like to find out a little bit more about how What To Watch works you can read <a href="${process.env.BASE_URL}/about" target="_blank">about us here.</a></p>
    <p>If you would like to get in contact with us you can <a href="${process.env.BASE_URL}/contact" target="_blank">follow this link here.</a></p><br><p>Many Thanks for using What To Watch</p><br>`
    await email.send_email(user.email, "Welcome To What To Watch 🍿", html_message);
    if (user) {
      console.log("Attemping to authenticate...");
      passport.authenticate("local")(req, res, function(){
        console.log("User successfully registered...");
        console.log(req.sessionID);
        req.logIn(user, function(err) {
          if (err) { return next(err); }
          console.log("Successfully logged in for user: " + req.user.email);
          return res.redirect('/userprofile');
        });
      });
    };    
  });
});

router.get("/api/insert_watch_providers", async (req, res) => {
  var results = [
    {
        "iso_3166_1": "AE",
        "english_name": "United Arab Emirates",
        "native_name": "United Arab Emirates"
    },
    {
        "iso_3166_1": "AR",
        "english_name": "Argentina",
        "native_name": "Argentina"
    },
    {
        "iso_3166_1": "AT",
        "english_name": "Austria",
        "native_name": "Austria"
    },
    {
        "iso_3166_1": "AU",
        "english_name": "Australia",
        "native_name": "Australia"
    },
    {
        "iso_3166_1": "BE",
        "english_name": "Belgium",
        "native_name": "Belgium"
    },
    {
        "iso_3166_1": "BG",
        "english_name": "Bulgaria",
        "native_name": "Bulgaria"
    },
    {
        "iso_3166_1": "BR",
        "english_name": "Brazil",
        "native_name": "Brazil"
    },
    {
        "iso_3166_1": "CA",
        "english_name": "Canada",
        "native_name": "Canada"
    },
    {
        "iso_3166_1": "CH",
        "english_name": "Switzerland",
        "native_name": "Switzerland"
    },
    {
        "iso_3166_1": "CZ",
        "english_name": "Czech Republic",
        "native_name": "Czech Republic"
    },
    {
        "iso_3166_1": "DE",
        "english_name": "Germany",
        "native_name": "Germany"
    },
    {
        "iso_3166_1": "DK",
        "english_name": "Denmark",
        "native_name": "Denmark"
    },
    {
        "iso_3166_1": "EE",
        "english_name": "Estonia",
        "native_name": "Estonia"
    },
    {
        "iso_3166_1": "ES",
        "english_name": "Spain",
        "native_name": "Spain"
    },
    {
        "iso_3166_1": "FI",
        "english_name": "Finland",
        "native_name": "Finland"
    },
    {
        "iso_3166_1": "FR",
        "english_name": "France",
        "native_name": "France"
    },
    {
        "iso_3166_1": "GB",
        "english_name": "United Kingdom",
        "native_name": "United Kingdom"
    },
    {
        "iso_3166_1": "HK",
        "english_name": "Hong Kong",
        "native_name": "Hong Kong SAR China"
    },
    {
        "iso_3166_1": "HR",
        "english_name": "Croatia",
        "native_name": "Croatia"
    },
    {
        "iso_3166_1": "HU",
        "english_name": "Hungary",
        "native_name": "Hungary"
    },
    {
        "iso_3166_1": "ID",
        "english_name": "Indonesia",
        "native_name": "Indonesia"
    },
    {
        "iso_3166_1": "IE",
        "english_name": "Ireland",
        "native_name": "Ireland"
    },
    {
        "iso_3166_1": "IN",
        "english_name": "India",
        "native_name": "India"
    },
    {
        "iso_3166_1": "IT",
        "english_name": "Italy",
        "native_name": "Italy"
    },
    {
        "iso_3166_1": "JP",
        "english_name": "Japan",
        "native_name": "Japan"
    },
    {
        "iso_3166_1": "KR",
        "english_name": "South Korea",
        "native_name": "South Korea"
    },
    {
        "iso_3166_1": "LT",
        "english_name": "Lithuania",
        "native_name": "Lithuania"
    },
    {
        "iso_3166_1": "MX",
        "english_name": "Mexico",
        "native_name": "Mexico"
    },
    {
        "iso_3166_1": "NL",
        "english_name": "Netherlands",
        "native_name": "Netherlands"
    },
    {
        "iso_3166_1": "NO",
        "english_name": "Norway",
        "native_name": "Norway"
    },
    {
        "iso_3166_1": "NZ",
        "english_name": "New Zealand",
        "native_name": "New Zealand"
    },
    {
        "iso_3166_1": "PH",
        "english_name": "Philippines",
        "native_name": "Philippines"
    },
    {
        "iso_3166_1": "PL",
        "english_name": "Poland",
        "native_name": "Poland"
    },
    {
        "iso_3166_1": "PT",
        "english_name": "Portugal",
        "native_name": "Portugal"
    },
    {
        "iso_3166_1": "RU",
        "english_name": "Russia",
        "native_name": "Russia"
    },
    {
        "iso_3166_1": "SE",
        "english_name": "Sweden",
        "native_name": "Sweden"
    },
    {
        "iso_3166_1": "SK",
        "english_name": "Slovakia",
        "native_name": "Slovakia"
    },
    {
        "iso_3166_1": "TR",
        "english_name": "Turkey",
        "native_name": "Turkey"
    },
    {
        "iso_3166_1": "US",
        "english_name": "United States of America",
        "native_name": "United States"
    },
    {
        "iso_3166_1": "ZA",
        "english_name": "South Africa",
        "native_name": "South Africa"
    }
  ]

  console.log("Inserting watch providers...");
  await watch_provider.insertMany(results);

  console.log("Inserted");

  return res.json({'success': true});


})

router.get("/logout",(req,res)=>{
  req.logout();
  res.redirect("/");
});


module.exports = router;