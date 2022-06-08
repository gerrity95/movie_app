const movies_service = require('../services/movies.service');
const logger = require('../../config/logger');

exports.get_movie = async function(req, res, next) {
  try {
    const movie_details = await movies_service.getMovie(req);
    return res.render('movie_profile', movie_details);
  } catch (err) {
    logger.error('Error attempting to render movie profile');
    logger.error(err);
    return next(err);
  }
};

exports.get_watchlist = async function(req, res, next) {
  try {
    const watchlist_details = await movies_service.getWatchlist(req);
    return res.render('watchlist', watchlist_details);
  } catch (err) {
    logger.error('Error attempting to render watchlist');
    logger.error(err);
    return next(err);
  }
};

exports.search = async function(req, res, next) {
  try {
    const search_results = await movies_service.searchMovies(req);
    return res.render('search', search_results);
  } catch (err) {
    logger.error('Error attempting to search for movies');
    logger.error(err);
    return next(err);
  }
};

exports.welcome_search = async function(req, res, next) {
  try {
    const search_results = await movies_service.searchMovies(req);
    return res.json(search_results);
  } catch (err) {
    logger.error('Error attempting to search for movies');
    logger.error(err);
    return next(err);
  }
};

exports.add_watchlist = async function(req, res, next) {
  try {
    const watchlist_results = await movies_service.addToWatchlist(req);
    return res.json(watchlist_results);
  } catch (err) {
    logger.error('Error attempting to add movie to watchlist');
    logger.error(err);
    return next(err);
  }
};
