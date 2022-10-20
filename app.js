const express = require('express');
const app = express();
const path = require('path');
const db = require('./src/config/database');
const routes = require('./src/routes');
const passport = require('passport');
const LocalStrategy = require('passport-local');
const User = require('./src/models/user');
const session = require('express-session');
const MongoStore = require('connect-mongodb-session')(session);
const promBundle = require('express-prom-bundle');
const dbConnection = db.connection;

const {
  PORT,
  MONGO_USERNAME,
  MONGO_PASSWORD,
  MONGO_HOSTNAME,
  MONGO_PORT,
  MONGO_DB,
  SESSION_SECRET,
} = process.env;

const store = new MongoStore({
  uri: `mongodb://${MONGO_USERNAME}:${MONGO_PASSWORD}@${MONGO_HOSTNAME}:${MONGO_PORT}/${MONGO_DB}?authSource=${MONGO_DB}`,
  collection: 'sessions',
});

// Add the options to the prometheus middleware most option are for http_request_duration_seconds histogram metric
// const metricsMiddleware = promBundle({
//   includeMethod: true,
//   includePath: true,
//   includeStatusCode: true,
//   includeUp: true,
//   customLabels: {project_name: 'whattowatch', project_type: 'nodejs_metrics'},
//   promClient: {
//     collectDefaultMetrics: {
//     },
//   },
// });

// session encoding
passport.serializeUser(User.serializeUser());
// session decoding
passport.deserializeUser(User.deserializeUser());
passport.use(new LocalStrategy(User.authenticate()));

app.use(express.static('public'));
app.set('views', path.join(__dirname, 'views'));
app.set('view engine', 'pug');
app.use(express.json());
app.use(express.urlencoded({extended: true}));
app.use(session({
  secret: `${SESSION_SECRET}`,
  resave: false,
  saveUninitialized: false,
  store: store,
  cookie: {maxAge: 87000000},
}));
app.use(passport.initialize());
app.use(passport.session());

// app.use(metricsMiddleware);
app.use('/', routes);

app.use(function(err, req, res, next) {
  // TODO add some monitoring/alerting framework so if we hit this we get alerted
  console.log('We have hit an error...');
  console.log(err);
  console.error(err.name);
  console.log(err.message);
  res.status(500);
  res.render('error', {'error': err});
});

app.listen(PORT, function() {
  console.log(`WhatToWatch Movies listening on ${PORT}!`);
});
