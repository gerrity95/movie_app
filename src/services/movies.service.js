const logger = require('../middlewares/logger');
const helpers = require('../utils/generic_helpers');
const watchlistModel = require('../models/movie_watchlist');
const watchProviders = require('../models/watch_providers');
const flaskApi = require('../utils/flask_api');
const tmdbapiService = require('./tmdbapi.service');

async function getMovie(req) {
  logger.info('Attempting to get movie detail for ' + req.params.movie_id);
  const watchProvidersPath = `${req.params.movie_id}/watch/providers`;
  const [watchProvidersContent, watchProviderCountries, ipInfo, isWatchlist, movieInfo,
    movieCast, movieRecommendations] = await Promise.all([
    tmdbapiService.get_movie_details(watchProvidersPath),
    watchProviders.find({}),
    helpers.get_ip_info(),
    watchlistModel.find({user_id: req.user._id, movie_id: req.params.movie_id}),
    tmdbapiService.get_movie_details(req.params.movie_id),
    tmdbapiService.generic_tmdb_query(req.params.movie_id, 'credits'),
    tmdbapiService.generic_tmdb_query(req.params.movie_id, 'recommendations'),
  ]).catch((err) => setImmediate(() => {
    logger.info('Error attempting to get data for Movie ' + req.params.movie_id);
    logger.info(err);
    throw err;
  }));
  let director = '';
  let screenplay = '';
  let writer = '';
  try {
    movieCast.body.crew.forEach(function(value) {
      if (value.job == 'Director') {
        director = value.name;
      }
      if (value.job == 'Screenplay') {
        screenplay = value.name;
      }
      if (value.job == 'Writer') {
        writer = value.name;
      }
    });
  } catch (e) {
    logger.info('Error: ' + e + ' attempting to get movie details');
    throw e;
  }
  let watchlistBool = false;
  if (isWatchlist.length == 1) {
    watchlistBool = true;
  }
  let castList;
  if (movieCast.body.cast.length > 8) {
    castList = [0, 1, 2, 3, 4, 5, 6, 7];
  } else {
    castList = [];
    for (let i = 0; i < movieCast.body.cast.length; i++) {
      castList.push(i);
    }
  }
  console.log(movieRecommendations.body);
  return {'movie_info': movieInfo.body, 'movie_credits': movieCast.body,
    'director': director, 'screenplay': screenplay, 'writer': writer,
    'is_watchlist': watchlistBool, 'cast_list': castList,
    'ip_info': ipInfo, 'watch_provider_countries': watchProviderCountries,
    'watch_providers_content': watchProvidersContent, 'reccomendations': movieRecommendations.body};
}

async function getWatchlist(req) {
  try {
    logger.info('Attempting to render watchlist for user ' + req.user._id);
    const watchlistMovies = await watchlistModel.find({user_id: req.user._id});
    const renderedWatchlist = await flaskApi.get_watchlist(req.user._id, watchlistMovies);
    logger.info('Successfully got response back from server when getting watchlist..');
    return {'watchlist': renderedWatchlist.body.result};
  } catch (err) {
    logger.error('Error attempting to render watchlist');
    logger.error(err);
    throw err;
  }
}

async function searchMovies(req) {
  try {
    logger.info('Attempting to process search search...');
    const searchResult = await tmdbapiService.search_query(req.body.search);
    return {'results': searchResult.body.results, 'query': req.body.search};
  } catch (err) {
    logger.error('Error attempting search request');
    logger.error(err);
    throw err;
  }
}

async function addToWatchlist(req) {
  try {
    logger.info('Attempting to Add movie to the watchlist...');
    const existingWatchlist = await watchlistModel.find({
      user_id: req.user._id,
      movie_id: req.body.movie_id,
    });
    if (existingWatchlist.length != 0) {
      logger.info(`Movie has already been added to the watchlist for this user. 
      Attempting to Remove...`);
      const deleteWatchlist = await watchlistModel.deleteOne({user_id: req.user._id, movie_id:
        req.body.movie_id});
      if (deleteWatchlist.deletedCount == 1) {
        logger.info('Succesfully deleted movie from watchlist');
        return {'success': true, 'removed': true};
      }
      logger.info('Issue seen attempting to remove movie from watchlist...');
      return {'success': false, 'removed': true};
    }
    logger.info(`Movie not yet added to watchlist for user ${req.user._id} attempting to add now.`);
    const newWatchlist = new watchlistModel({
      user_id: req.user._id,
      movie_id: req.body.movie_id,
    });
    await watchlistModel.create(newWatchlist);

    return {'success': true, 'removed': false};
  } catch (err) {
    logger.error('Error attempting to add movie to watchlist');
    logger.error(err);
    throw err;
  }
}


module.exports = {
  getMovie,
  getWatchlist,
  searchMovies,
  addToWatchlist,
};
