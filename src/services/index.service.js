/* eslint-disable no-var */
const logger = require('../middlewares/logger');
const helpers = require('../utils/generic_helpers');
const {filterBlocklist} = require('../utils/media.helpers');
const flaskApi = require('../utils/flask_api');
const tmdbapiService = require('./tmdbapi.service');
const passport = require('passport');
const dotenv = require('dotenv');
dotenv.config();
const {
  NODE_ENV,
} = process.env;
if (NODE_ENV == 'tv') {
  var ratedModel = require('../models/tv.rated');
} else {
  var ratedModel = require('../models/rated_movies');
}


async function getUserProfile(req) {
  logger.info('Attempting to get movie data...');
  logger.info('Getting genre list..');
  const genres = await tmdbapiService.getGenres();
  logger.info('Getting shows...');
  const shows = await flaskApi.get_reccomendations(req.user._id);
  // showss = flaskApi.sample_movies()
  if (shows.status == 200) {
    const filteredShows = filterBlocklist(shows.body.result);
    return {data: {node_env: NODE_ENV,
      user_info: req.user, media_info: filteredShows, genres: genres.body.genres}};
  } else {
    return {data: {node_env: NODE_ENV, user_info: req.user,
      media_info: 'Bad', genres: genres.body.genres}};
  }
}

async function getUserProfileAjax(req) {
  logger.info('AJAX request made to get user profile...');
  logger.info('Attempting to get movie data...');
  const shows = await flaskApi.get_reccomendations(req.user._id);
  // shows = flaskApi.sample_movies()
  if (shows.status == 200) {
    return {'node_env': NODE_ENV, 'success': true, 'media_rated': true};
  } else {
    return {'node_env': NODE_ENV, 'success': false, 'media_rated': true};
  }
}

async function getWelcome(req) {
  logger.info('Attempting to render welcome page...');
  const ratedMedia = await ratedModel.find({
    user_id: req.user._id,
  });
  if (ratedMedia.length >= 5) {
    return {rated_media: ratedMedia.length, data: {}};
  }
  const rndInt = helpers.random_number(1, 8);
  const inspireQuery = `language=en-US&sort_by=popularity.desc&include_adult=false&include_video=false&page=${rndInt}&vote_average.gte=8&with_original_language=en&vote_count.gte=1000`;
  const inspirationMedia = await tmdbapiService.discoverSearch(inspireQuery);
  let inspiryList = false;
  if (inspirationMedia.status == 200) {
    inspiryList = inspirationMedia.body.results;
  }

  return {rated_media: ratedMedia.length, data: {'user_info': req.user, 'node_env': NODE_ENV,
    'media_info': 'Bad', 'media_count': ratedMedia.length, 'inspire_medias': inspiryList}};
}

async function loginPost(req) {
  passport.authenticate('local', function(err, user, info) {
    const url = req.get('referer').split('?')[0];
    logger.info('Attempted login from: ' + url);
    if (err) {
      logger.info('Error: ' + err + ' when attempting to login');
      return {failed_login: true};
    }

    console.log(user);

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

const profileRedirect = async (req) => {
  const profileInfo = await getUserProfile(req);
  if (profileInfo.rated_media < 5) {
    return {status: 'welcome'};
  }
  return {status: 'profile', userProfile: profileInfo.data};
};

module.exports = {
  profileRedirect,
  getUserProfile,
  getUserProfileAjax,
  getWelcome,
  loginPost,
  handleRegisterError,
};
