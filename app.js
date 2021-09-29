const express = require('express');
const app = express();
const router = express.Router();
const db = require('./config/database');
const path = require('path');
const indexRouter = require('./routes/index');
const passport = require("passport");
const LocalStrategy = require("passport-local");
const User = require("./models/user");

const port = 3000;


passport.serializeUser(User.serializeUser());       //session encoding
passport.deserializeUser(User.deserializeUser());   //session decoding
passport.use(new LocalStrategy(User.authenticate()));

app.use(express.static('public'));
app.set('views', path.join(__dirname, 'views'));
app.set('view engine', 'pug');
app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use(require("express-session")({
  secret:"markgerrity",       //decode or encode session
  resave: false,          
  saveUninitialized:false    
}));
app.use(passport.initialize());
app.use(passport.session());

app.use('/', indexRouter);

app.listen(port, function () {
  console.log(`Example app listening on ${port}!`)
})
