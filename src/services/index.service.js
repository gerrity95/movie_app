const logger = require('../middlewares/logger');
const helpers = require('../utils/generic_helpers');
const ratedModel = require('../models/rated_movies');
const flaskApi = require('../utils/flask_api');
const tmdbapiService = require('./tmdbapi.service');
const passport = require('passport');

async function getUserProfile(req) {
  logger.info('Checking to ensure enough reviews have been processed for the user: ' +
  req.user._id);
  const ratedMovies = await ratedModel.find({
    user_id: req.user._id,
  });
  if (ratedMovies.length < 5) {
    logger.info('Not enough movies have been rated by user: ' + req.user._id);
    return {rated_movies: ratedMovies.length, data: {}};
  }
  logger.info('Attempting to get movie data...');
  logger.info('Getting genre list..');
  const genres = await tmdbapiService.getGenres();
  logger.info('Getting shows...');
  const shows = await flaskApi.get_reccomendations(req.user._id);
  // showss = flaskApi.sample_movies()
  if (shows.status == 200) {
    return {rated_movies: ratedMovies.length, data: {
      user_info: req.user, movie_info: shows.body.result, genres: genres.body.genres}};
  } else {
    return {rated_movies: ratedMovies.length, data: {user_info: req.user, movie_info: 'Bad',
      genres: genres.body.genres}};
  }
}

async function getUserProfileAjax(req) {
  logger.info('AJAX request made to get user profile...');
  logger.info('Checking to ensure enough reviews have been processed for user: ' + req.user._id);
  const ratedMovies = await ratedModel.find({
    user_id: req.user._id,
  });
  if (ratedMovies.length < 5) {
    logger.info('Not enough movies have been rated by user: ' + req.user._id);
    return {'success': false, 'movies_rated': false, 'movie_count': ratedMovies.length};
  }
  logger.info('Attempting to get movie data...');
  const shows = await flaskApi.get_reccomendations(req.user._id);
  // shows = flaskApi.sample_movies()
  if (shows.status == 200) {
    return {'success': true, 'movies_rated': true};
  } else {
    return {'success': false, 'movies_rated': true};
  }
}

async function getWelcome(req) {
  logger.info('Attempting to render welcome page...');
  const ratedMovies = await ratedModel.find({
    user_id: req.user._id,
  });
  if (ratedMovies.length > 5) {
    return {rated_movies: ratedMovies.length, data: {}};
  }
  const rndInt = helpers.random_number(1, 8);
  const inspireQuery = `language=en-US&sort_by=popularity.desc&include_adult=false&include_video=false&page=${rndInt}&vote_average.gte=8&with_original_language=en&vote_count.gte=1000`;
  const inspirationMovies = await tmdbapiService.discoverSearch(inspireQuery);
  let inspiryList = false;
  if (inspirationMovies.status == 200) {
    inspiryList = inspirationMovies.body.results;
  }

  return {rated_movies: ratedMovies.length, data: {'user_info': req.user, 'movie_info': 'Bad',
    'movie_count': ratedMovies.length, 'inspire_movies': inspiryList}};
}

async function loginPost(req) {
  passport.authenticate('local', function(err, user, info) {
    const url = req.get('referer').split('?')[0];
    logger.info('Attempted login from: ' + url);
    if (err) {
      logger.info('Error: ' + err + ' when attempting to login');
      return {failed_login: true};
    }

    if (!user) {
      logger.info('Authentication problem. Email/Password is incorrect');
      return {failed_login: true};
    }

    req.logIn(user, function(err) {
      if (err) {
        throw (err);
      }
      logger.info('Successfully logged in for user: ' + req.user.email);
      return {failed_login: false};
    });
  });
}

function handleRegisterError(err) {
  logger.info(err.name);
  if (err.name == 'UserExistsError') {
    logger.info('Cannot create user as they already exist.');
    return {fail_message: '?user_exists=True'};
  } else if (err.name == 'MongoServerError') {
    if (err.message.includes('E11000 duplicate key error')) {
      logger.info('Cannot create user as they already exist.');
      return {fail_message: '?email_exists=True'};
    }
  }
  logger.info('Unknown error when attempting to register');
  logger.info(err);
  return {fail_message: '?error=True'};
}


module.exports = {
  getUserProfile,
  getUserProfileAjax,
  getWelcome,
  loginPost,
  handleRegisterError,
};
