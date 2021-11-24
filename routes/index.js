const express = require('express');
const router = express.Router();
const path = require('path');
const User = require("../models/user");
const passport = require("passport");
const passportLocalMongoose = require("passport-local-mongoose");
const flask_api = require('./helpers/flask_api');
const helpers = require('./helpers/generic_helpers');
const reccs_model = require('../models/recommended_movies')
const rated_model = require('../models/rated_movies')

router.use (function (req, res, next) {
  console.log('/' + req.method);
  next();
});

router.get("/", (req,res) =>{
  res.render("home");
})

router.get("/userprofile", helpers.is_logged_in, async (req,res) =>{
  console.log("Checking to ensure enough reviews have been processed for user: " + req.user._id)
  let rated_movies = await rated_model.find({
    user_id: req.user._id
  })
  if (rated_movies.length < 5) {
    console.log("Not enough movies have been rated by user: " + req.user._id)
    return res.redirect('/welcome')
  }
  console.log("Attempting to get movie data...");
  shows = await flask_api.get_reccomendations(req.user._id)
  //shows = flask_api.sample_movies()
  console.log(shows)
  if (shows.status == 200) {
    res.render("user_profile", {user_info: req.user, movie_info: shows.body.result});
  }
  else {
    res.render("user_profile", {user_info: req.user, movie_info: 'Bad'});
  }

})

router.get("/user/userprofile", async (req,res) =>{

  if (req.user) {
    console.log("AJAX request made to get user profile...")
    console.log("Checking to ensure enough reviews have been processed for user: " + req.user._id)
    let rated_movies = await rated_model.find({
      user_id: req.user._id
    })
    if (rated_movies.length < 5) {
      console.log("Not enough movies have been rated by user: " + req.user._id)
      return res.json({'success': false, 'movies_rated': false})
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
  let rated_movies = await rated_model.find({
    user_id: req.user._id
  });
  if (rated_movies.length > 5) {
    console.log("Too many movies have been rated by user: " + req.user._id)
    return res.redirect('/userprofile')
  }
  return res.render("welcome", {user_info: req.user, movie_info: 'Bad'});
  
})

//Auth Routes
router.get("/login",(req,res)=>{
  res.render("login");
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

router.get("/register",(req,res)=>{
  res.render("register");
});

router.post("/register",(req,res)=>{
  var url = req.get('referer').split('?')[0];
  if (!isValidPassword(req.body.password)) {
    console.log("Password does not meet requirements.");
    return res.redirect(url + "?bad_password=True")
  }
    
  User.register(new User({
    username: req.body.username, 
    email: req.body.email,
    first_name: req.body.first_name,
    last_name: req.body.last_name}),
    req.body.password, function(err,user){
      if(err){
        if (err.name == 'UserExistsError') {
          console.log("Cannot create user as they already exist.");
          return res.redirect(url + "?user_exists=True");
        }
        console.log("Unknown error when attempting to register")
        console.log(err);
        return res.redirect(url + "?error=True");
      }
  passport.authenticate("local")(req, res, function(){
    console.log("User successfully registered...");
    console.log(req.sessionID);
    return res.redirect('/userprofile')
  })    
  })
})

router.get("/logout",(req,res)=>{
  req.logout();
  res.redirect("/");
});

function isValidPassword(password) {
  if (password.length >= 8) {
    return true;
  }
  return false;
};


module.exports = router;