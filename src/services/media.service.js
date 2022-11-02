/* eslint-disable no-var */
const logger = require('../middlewares/logger');
const helpers = require('../utils/generic_helpers');
const watchProviders = require('../models/watch_providers');
const flaskApi = require('../utils/flask_api');
const tmdbapiService = require('./tmdbapi.service');
const dotenv = require('dotenv');
dotenv.config();
const {
  NODE_ENV,
} = process.env;

if (NODE_ENV == 'television') {
  var watchlistModel = require('../models/tv.watchlist');
} else {
  var watchlistModel = require('../models/movie_watchlist');
}
const idKey = `${NODE_ENV}_id`;

async function getMedia(req) {
  logger.info('Attempting to get media detail for ' + req.params.media_id);
  const watchProvidersPath = `${req.params.media_id}/watch/providers`;
  const [watchProvidersContent, watchProviderCountries, ipInfo, isWatchlist,
    mediaInfo] = await Promise.all([
    tmdbapiService.getMediaDetails(watchProvidersPath, false),
    watchProviders.find({}),
    helpers.get_ip_info(),
    watchlistModel.find({user_id: req.user._id, [idKey]: req.params.media_id}),
    tmdbapiService.getMediaDetails(req.params.media_id, true),
  ]).catch((err) => setImmediate(() => {
    logger.error('Error attempting to get data for Media ' + req.params.media_id);
    logger.error(err);
    throw err;
  }));

  if (mediaInfo.status === 404) {
    logger.info(`Unable to find media in TMDB for ${req.params.media_id}`);
    throw new Error('Unable to find media');
  }

  let director = '';
  let screenplay = '';
  let writer = '';
  try {
    mediaInfo.body.credits.crew.forEach(function(value) {
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
    logger.info('Error: ' + e + ' attempting to get media details');
    throw e;
  }
  let watchlistBool = false;
  if (isWatchlist.length == 1) {
    watchlistBool = true;
  }
  let castList;
  if (mediaInfo.body.credits.cast.length > 8) {
    castList = [0, 1, 2, 3, 4, 5, 6, 7];
  } else {
    castList = [];
    for (let i = 0; i < mediaInfo.body.credits.cast.length; i++) {
      castList.push(i);
    }
  }

  return {'media_info': mediaInfo.body, 'media_credits': mediaInfo.body.credits,
    'director': director, 'screenplay': screenplay, 'writer': writer,
    'is_watchlist': watchlistBool, 'cast_list': castList,
    'ip_info': ipInfo, 'watch_provider_countries': watchProviderCountries,
    'watch_providers_content': watchProvidersContent, 
    'reccomendations': mediaInfo.body.recommendations};
}

async function getWatchlist(req) {
  try {
    logger.info('Attempting to render watchlist for user ' + req.user._id);
    const watchlistMedia = await watchlistModel.find({user_id: req.user._id});
    const renderedWatchlist = await flaskApi.get_watchlist(req.user._id, watchlistMedia);
    logger.info('Successfully got response back from server when getting watchlist..');
    return {'watchlist': renderedWatchlist.body.result};
  } catch (err) {
    logger.error('Error attempting to render watchlist');
    logger.error(err);
    throw err;
  }
}

async function searchMedia(req) {
  try {
    logger.info('Attempting to process search search...');
    const searchResult = await tmdbapiService.tmdbSearch(req.body.search);
    return {'results': searchResult.body.results, 'query': req.body.search};
  } catch (err) {
    logger.error('Error attempting search request');
    logger.error(err);
    throw err;
  }
}

async function addToWatchlist(req) {
  try {
    logger.info('Attempting to Add media to the watchlist...');
    const existingWatchlist = await watchlistModel.find({
      user_id: req.user._id,
      [idKey]: req.body.media_id,
    });
    if (existingWatchlist.length != 0) {
      logger.info(`Media has already been added to the watchlist for this user. 
      Attempting to Remove...`);
      const deleteWatchlist = await watchlistModel.deleteOne({user_id: req.user._id, [idKey]:
        req.body.media_id});
      if (deleteWatchlist.deletedCount == 1) {
        logger.info('Succesfully deleted media from watchlist');
        return {'success': true, 'removed': true};
      }
      logger.info('Issue seen attempting to remove media from watchlist...');
      return {'success': false, 'removed': true};
    }
    logger.info(`Media not yet added to watchlist for user ${req.user._id} attempting to add now.`);
    const newWatchlist = new watchlistModel({
      user_id: req.user._id,
      [idKey]: req.body.media_id,
    });
    await watchlistModel.create(newWatchlist);

    return {'success': true, 'removed': false};
  } catch (err) {
    logger.error('Error attempting to add media to watchlist');
    logger.error(err);
    throw err;
  }
}


module.exports = {
  getMedia,
  getWatchlist,
  searchMedia,
  addToWatchlist,
};
