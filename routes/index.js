const express = require('express');
const router = express.Router();
const path = require('path');
const User = require("../models/user");
const passport = require("passport");
const passportLocalMongoose = require("passport-local-mongoose");

router.use (function (req, res, next) {
  console.log('/' + req.method);
  next();
});

router.get("/", (req,res) =>{
  res.render("home");
})

router.get("/userprofile", isLoggedIn, (req,res) =>{
  res.render("user_profile", {user_info: req.user});
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
         console.log(res)
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

router.get("/api/test", isLoggedIn, (req,res) =>{
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

function isLoggedIn(req,res,next) {
  if(req.isAuthenticated()){
      console.log(req)
      return next();
  }
}



module.exports = router;