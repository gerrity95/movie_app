const express = require('express');
const app = express();
const router = express.Router();
const db = require('./config/database');
const email = require('./config/email');
const path = require('path');
const indexRouter = require('./routes/index');
const movieRouter = require('./routes/movies');
const tmdbRouter = require('./routes/tmdb_api');
const errorRouter = require('./routes/error');
const passwordRouter = require('./routes/password_reset');
const passport = require("passport");
const LocalStrategy = require("passport-local");
const User = require("./models/user");
const session = require("express-session");
const MongoStore = require("connect-mongodb-session")(session);
const db_connection = db.connection;
const email_transporter = email.transporter;

const port = 3000;

const {
  MONGO_USERNAME,
  MONGO_PASSWORD,
  MONGO_HOSTNAME,
  MONGO_PORT,
  MONGO_DB
} = process.env;

var store = new MongoStore({
  uri: `mongodb://${MONGO_USERNAME}:${MONGO_PASSWORD}@${MONGO_HOSTNAME}:${MONGO_PORT}/${MONGO_DB}?authSource=${MONGO_DB}`,
  collection: 'sessions'
});

passport.serializeUser(User.serializeUser());       //session encoding
passport.deserializeUser(User.deserializeUser());   //session decoding
passport.use(new LocalStrategy(User.authenticate()));

app.use(express.static('public'));
app.set('views', path.join(__dirname, 'views'));
app.set('view engine', 'pug');
app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use(session({
  secret:"markgerrity",       //decodde or encode session
  resave: false,          
  saveUninitialized:false,
  store: store,
  cookie: { maxAge: 87000000 }    
}));
app.use(passport.initialize());
app.use(passport.session());

app.use('/', indexRouter);
app.use('/', movieRouter);
app.use('/', tmdbRouter.router);
app.use('/', passwordRouter);
app.use('/', errorRouter);

app.use(function(err, req, res, next){
  //TODO add some monitoring/alerting framework so if we hit this we get alerted
  console.log("We have hit an error...")
  console.log(err);
  console.error(err.name);
  console.log(err.message)
  res.status(500);
  res.render('error', {'error': err});
});

app.listen(port, function () {
  console.log(`Example app listening on ${port}!`)
})
