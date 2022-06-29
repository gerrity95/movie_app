const moviesService = require('../services/movies.service');
const logger = require('../middlewares/logger');

exports.get_movie = async function(req, res, next) {
  try {
    const movieDetails = await moviesService.getMovie(req);
    return res.render('movie_profile', movieDetails);
  } catch (err) {
    logger.error('Error attempting to render movie profile');
    logger.error(err);
    return next(err);
  }
};

exports.get_watchlist = async function(req, res, next) {
  try {
    const watchlistDetails = await moviesService.getWatchlist(req);
    return res.render('watchlist', watchlistDetails);
  } catch (err) {
    logger.error('Error attempting to render watchlist');
    logger.error(err);
    return next(err);
  }
};

exports.search = async function(req, res, next) {
  try {
    const searchResults = await moviesService.searchMovies(req);
    return res.render('search', searchResults);
  } catch (err) {
    logger.error('Error attempting to search for movies');
    logger.error(err);
    return next(err);
  }
};

exports.welcome_search = async function(req, res, next) {
  try {
    const searchResults = await moviesService.searchMovies(req);
    return res.json(searchResults);
  } catch (err) {
    logger.error('Error attempting to search for movies');
    logger.error(err);
    return next(err);
  }
};

exports.add_watchlist = async function(req, res, next) {
  try {
    const watchlisResults = await moviesService.addToWatchlist(req);
    return res.json(watchlisResults);
  } catch (err) {
    logger.error('Error attempting to add movie to watchlist');
    logger.error(err);
    return next(err);
  }
};
