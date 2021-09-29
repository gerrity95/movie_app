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

router.post("/login",passport.authenticate("local",{
  successRedirect:"/userprofile",
  failureRedirect:"/login"
}),function (req, res){
});

router.get("/register",(req,res)=>{
  res.render("register");
});

router.post("/register",(req,res)=>{
    
  User.register(new User({
    username: req.body.username, 
    email: req.body.email,
    first_name: req.body.first_name,
    last_name: req.body.last_name}),
    req.body.password, function(err,user){
      if(err){
          console.log(err);
          res.render("register");
      }
  passport.authenticate("local")(req, res, function(){
      res.redirect("/login");
  })    
  })
})

router.get("/logout",(req,res)=>{
  req.logout();
  res.redirect("/");
});

function isLoggedIn(req,res,next) {
  if(req.isAuthenticated()){
      return next();
  }
  res.redirect("/login");
}



module.exports = router;