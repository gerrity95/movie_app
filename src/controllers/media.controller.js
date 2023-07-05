const mediaService = require('../services/media.service');
const logger = require('../middlewares/logger');

exports.getMedia = async function(req, res, next) {
  try {
    const mediaDetails = await mediaService.getMedia(req);
    return res.render('media_profile', mediaDetails);
  } catch (err) {
    if (err.message === 'Unable to find media') {
      logger.error('Unable to find media in TMDB');
      res.set('Connection', 'close');
      res.status(404);
      return res.render('404error', {user_info: req.user});
    }
    logger.error('Error attempting to render media profile');
    logger.error(err);
    return next(err);
  }
};

exports.get_watchlist = async function(req, res, next) {
  try {
    const watchlistDetails = await mediaService.getWatchlist(req);
    return res.render('watchlist', watchlistDetails);
  } catch (err) {
    logger.error('Error attempting to render watchlist');
    logger.error(err);
    return next(err);
  }
};

exports.search = async function(req, res, next) {
  try {
    const searchResults = await mediaService.searchMedia(req);
    return res.render('search', searchResults);
  } catch (err) {
    logger.error('Error attempting to search for movies');
    logger.error(err);
    return next(err);
  }
};

exports.welcome_search = async function(req, res, next) {
  try {
    const searchResults = await mediaService.searchMedia(req);
    return res.json(searchResults);
  } catch (err) {
    logger.error('Error attempting to search for movies');
    logger.error(err);
    return next(err);
  }
};

exports.add_watchlist = async function(req, res, next) {
  try {
    const watchlisResults = await mediaService.addToWatchlist(req);
    return res.json(watchlisResults);
  } catch (err) {
    logger.error('Error attempting to add movie to watchlist');
    logger.error(err);
    return next(err);
  }
};
