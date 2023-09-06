/* eslint-disable no-var */
const logger = require('../middlewares/logger');
const helpers = require('../utils/generic_helpers');
const {parseMediaOutput, parseReccs} = require('../utils/media.helpers');
const watchProviders = require('../models/watch_providers');
const flaskApi = require('../utils/flask_api');
const tmdbapiService = require('./tmdbapi.service');
const dotenv = require('dotenv');
dotenv.config();
const {
  NODE_ENV,
} = process.env;

if (NODE_ENV == 'tv') {
  var recommendationsModel = require('../models/tv.reccs');
  var watchlistModel = require('../models/tv.watchlist');
  var blocklistModel = require('../models/tv.blocklist');
  var watchlistType = 'watchlist_televisions';
  var blocklistType = 'blocklist_televisions';
  var id = 'tv_id';
} else {
  var recommendationsModel = require('../models/recommended_movies');
  var watchlistModel = require('../models/movie_watchlist');
  var blocklistModel = require('../models/movie.blocklist');
  var watchlistType = 'watchlist_movies';
  var blocklistType = 'blocklist_movies';
  var id = 'movie_id';
}
const idKey = `${NODE_ENV}_id`;

async function getMedia(req) {
  logger.info('Attempting to get media detail for ' + req.params.media_id);
  const userAgg = userMediaAggregate(req.user.id, parseInt(req.params.media_id));
  const watchProvidersPath = `${req.params.media_id}/watch/providers`;
  const [watchProvidersContent, watchProviderCountries, ipInfo,
    userInfo, mediaInfo] = await Promise.all([
    tmdbapiService.getMediaDetails(watchProvidersPath, false),
    watchProviders.find({}),
    helpers.get_ip_info(),
    recommendationsModel.aggregate(userAgg),
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

  logger.info('Attempting to parse response for output');
  const mediaParsed = parseMediaOutput(mediaInfo);
  const recommendations = parseReccs(mediaInfo.body.recommendations);
  const userParsed = parseUserInfo(userInfo[0], parseInt(req.params.media_id));

  return {'media_info': mediaParsed, 'media_weight': userParsed.mediaWeight,
    'is_watchlist': userParsed.isWatchlist, 'is_blocklist': userParsed.isBlocklist,
    'ip_info': ipInfo, 'watch_provider_countries': watchProviderCountries,
    'watch_providers_content': watchProvidersContent,
    'recommendations': recommendations};
}

async function getWatchlist(req) {
  try {
    logger.info('Attempting to render watchlist for user ' + req.user._id);
    const watchlistMedia = await watchlistModel.find({user_id: req.user._id});
    console.log(watchlistMedia);
    const renderedWatchlist = await flaskApi.get_watchlist(req.user._id, watchlistMedia);
    logger.info('Successfully got response back from server when getting watchlist..');
    console.log(renderedWatchlist.body.result);
    return {watchlist: renderedWatchlist.body.result, node_env: NODE_ENV};
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
    console.log(req.body);
    console.log(idKey);
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

const updateListModel = async (req, modelType) => {
  try {
    let chosenModel;
    let updateType;
    if (modelType == 'watchlist') {
      chosenModel = watchlistModel;
    } else {
      chosenModel = blocklistModel;
    }

    logger.info(`Attempting to Add media to the ${modelType}...`);
    console.log(req.body);
    console.log(idKey);
    const isExisting = await chosenModel.find({
      user_id: req.user._id,
      [idKey]: req.body.media_id,
    });
    if (isExisting.length != 0) {
      updateType = false;
      logger.info(`Media has already been added to the ${modelType} for this user. 
      Attempting to Remove...`);
      const deleteMedia = await chosenModel.deleteOne({user_id: req.user._id, [idKey]:
        req.body.media_id});
      if (deleteMedia.deletedCount == 1) {
        logger.info(`Succesfully deleted media from ${modelType}`);
        // If blocklist, send a request to the backend in the background to update the recommendations
        if (modelType == 'blocklist') {
          logger.info('Sending request to backend to update recommendations with blocklist...');
          flaskApi.updateBlocklist(req.user._id, req.body.media_id, updateType);
        }
        return {'success': true, 'removed': true};
      }
      logger.info(`Issue seen attempting to remove media from ${modelType}...`);
      return {'success': false, 'removed': true};
    }
    updateType = true;
    logger.info(`Media not yet added to ${modelType} for user ${req.user._id}, adding now.`);
    const newBlockList = new chosenModel({
      user_id: req.user._id,
      [idKey]: req.body.media_id,
    });
    await chosenModel.create(newBlockList);

    // If blocklist, send a request to the backend in the background to update the recommendations
    if (modelType == 'blocklist') {
      logger.info('Sending request to backend to update recommendations with blocklist...');
      flaskApi.updateBlocklist(req.user._id, req.body.media_id, updateType);
    }

    return {'success': true, 'removed': false};
  } catch (err) {
    logger.error(`Error attempting to add media to ${modelType}`);
    logger.error(err);
    throw err;
  }
};

const userMediaAggregate = (userId, mediaId) => {
  // A function that builds out an aggregate to get all user data related to a given movie
  return [
    {
      '$match': {
        'user_id': userId,
      },
    }, {
      '$lookup': {
        'from': watchlistType,
        'let': {'userId': '$user_id', 'movieId': mediaId},
        'pipeline': [
          {
            '$match': {
              '$expr': {
                '$and': [
                  {
                    '$eq': ['$user_id', '$$userId'],
                  }, {
                    '$eq': ['$movie_id', '$$movieId'],
                  },
                ],
              },
            },
          },
        ],
        'as': 'watchlist',
      },
    }, {
      '$lookup': {
        'from': blocklistType,
        'let': {'userId': '$user_id', 'movieId': mediaId},
        'pipeline': [
          {
            '$match': {
              '$expr': {
                '$and': [
                  {
                    '$eq': ['$user_id', '$$userId'],
                  }, {
                    '$eq': ['$movie_id', '$$movieId'],
                  },
                ],
              },
            },
          },
        ],
        'as': 'blocklist',
      },
    },
  ];
};

const parseUserInfo = (userInfo, mediaId) => {
  console.log(userInfo);
  // This function will take the response from the aggregate to get the user and return only the relevant info
  var mediaWeight = 0;

  // Get user weight
  userInfo.recommendations.forEach((recommendation) => {
    if (recommendation[id] == mediaId) {mediaWeight = recommendation['weight'];}
  });
  const isWatchlist = (userInfo.watchlist.length > 0) ? true : false;
  const isBlocklist = (userInfo.blocklist.length > 0) ? true : false;
  return {mediaWeight, isWatchlist, isBlocklist};
};


module.exports = {
  getMedia,
  getWatchlist,
  searchMedia,
  addToWatchlist,
  updateListModel,
};
