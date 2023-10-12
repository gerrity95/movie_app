/* eslint-disable no-var */
const logger = require('../middlewares/logger');
const flaskApi = require('../utils/flask_api');
const dotenv = require('dotenv');
const https = require('https');

dotenv.config();

const {
  TMDB_READ_TOKEN,
  NODE_ENV,
  API_ENDPOINT,
} = process.env;

if (NODE_ENV == 'tv') {
  var mediaRateModel = require('../models/tv.rated');
} else {
  var mediaRateModel = require('../models/rated_movies');
}

async function submitRatingService(req) {
  /**
   * Function to submit a rating and process it
   */
  try {
    const url = req.get('referer');
    const isRated = await isMediaRated(req, url);
    if (isRated.updated) {
      return isRated;
    }
    logger.info(`${NODE_ENV} has not already been rated. Appending to ${NODE_ENV} ratings.`);
    logger.info(`Attempting to get ${NODE_ENV} details for: ${req.body.media_id}`);
    const mediaDetails = await ratedMediaDetails(req);
    const submitRating = await submitMediaRating(req, mediaDetails.mediaDetails,
        mediaDetails.directorId, mediaDetails.mediaKeywords, isRated.numRated, url);

    // Will attempt to generate reccs in background each time we add a new rating for improved performance
    if (submitRating.meet_requirements) {
      logger.info('Going to attempt to update the recommendations in the background...');
      flaskApi.get_reccomendations(req.user._id);
    }
    return submitRating;
  } catch (e) {
    logger.error('Error attempting to add show to the DB.');
    logger.error(e);
    return {'success': false, 'meet_requirements': true};
  }
}

async function isMediaRated(req, url) {
  /**
   * Function to identify if the media has already been rated
   */
  try {
    logger.info(`Checking count of rated ${NODE_ENV} to see if they\'ve passed the welcome period`);
    const ratedCount = await mediaRateModel.find({
      'user_id': req.user._id,
    });
    const numRated = ratedCount.length;
    logger.info('Number of medias rated so far: ' + numRated);

    // Stop users from rating medias on the media page before completing the welcome section
    if (!url.includes('welcome')) {
      if (numRated < 5) {
        logger.error('User tried to work around to the media page before completing induction..');
        return {'success': false, 'meet_requirements': false,
          'numRated': numRated, 'updated': true};
      }
    }

    logger.info('Checking to see if already rated...');
    logger.info('Submitted rating: ' + req.body.rating + ' for media: ' + req.body.media_id);
    const idKey = `${NODE_ENV}_id`;
    const isRated = await mediaRateModel.findOne({
      [idKey]: req.body.media_id,
      'user_id': req.user._id,
    });
    if (isRated) {
      if (url.includes('welcome')) {
        logger.info('Media has already been rated. Must be a new media during welcome initiaion');
        return {'success': false, 'is_rated': true, 'updated': true, 'numRated': numRated};
      }
      logger.info('Media has already been rated. Updating the rating.');
      isRated.rating = req.body.rating;
      await isRated.save();
      return {'success': true, 'updated': true, 'numRated': numRated};
    }

    return {'updated': false, 'numRated': numRated};
  } catch (e) {
    logger.error('Error attempting to identify if a media has already been rated');
    logger.error(e);
    throw e;
  }
}

async function ratedMediaDetails(req) {
  /**
   * Function to gather media details needed for submitting a rating
   */
  try {
    const mediaDetails = await getMediaDetails(req.body.media_id, true);
    if (mediaDetails.status != 200) {
      logger.error('Unable to fulfill request to add media to DB. Cannot get media details');
      throw new Error('Unable to fulfill request to add media to DB. Cannot get media details');
    };

    let mediaKeywords = [];
    let directorId = '';
    if (NODE_ENV == 'tv') {
      // directorId = mediaDetails.body.created_by[0].name;
      directorId = getTvDirector(mediaDetails);
      mediaKeywords = mediaDetails.body.keywords.results;
    } else {
      mediaDetails.body.credits.crew.forEach(function(value) {
        if (value.job == 'Director') {
          directorId = value.id;
        }
      });
      mediaKeywords = mediaDetails.body.keywords.keywords;
    }
    return {'mediaDetails': mediaDetails, 'mediaKeywords': mediaKeywords,
      'mediaCast': mediaDetails.body.credits, 'directorId': directorId};
  } catch (e) {
    logger.error('Error attempting to gather details for media when rating');
    logger.error(e);
    throw e;
  }
}

async function submitMediaRating(req, mediaDetails, directorId, mediaKeywords, numRated, url) {
  /**
   * Function to identify to submit rating for a given user
   */
  try {
    logger.info('Attempting to add show to DB...');
    const keyId = `${NODE_ENV}_id`;
    const newShow = new mediaRateModel({
      user_id: req.user._id,
      rating: req.body.rating,
      [keyId]: req.body.media_id,
      genres: mediaDetails.body.genres,
      languages: mediaDetails.body.original_language,
      tmdb_rating: mediaDetails.body.vote_average,
      // production_companies: mediaDetails.body.production_companies,
      director: directorId,
      keywords: mediaKeywords,
    });

    if (NODE_ENV == 'tv') {
      newShow.networks = mediaDetails.body.networks[0];
    } else {
      newShow.production_companies = mediaDetails.body.production_companies;
    }

    await mediaRateModel.create(newShow);

    numRated = numRated + 1;
    logger.info('Number of medias rated so far: ' + numRated);
    if (url.includes('welcome')) {
      // If coming from welcome screen the user will get redirected to their profile once they've rated 5 medias.
      if (numRated >= 5) {
        logger.info('Enough medias rated to start getting recommendations...');
        return {'success': true, 'meet_requirements': true};
      } else {
        logger.info('Not enough medias rated to start generating recommendations.');
        return {'success': true, 'meet_requirements': false, 'num_rated': numRated};
      }
    }
    return {'success': true, 'meet_requirements': true, 'num_rated': numRated};
  } catch (e) {
    logger.error('Error attempting to submit rating');
    logger.error(e);
    console.log(e);
    throw e;
  }
}

async function getMediaDetails(mediaId, isAppended) {
  let requestPath;
  if (isAppended) {
    requestPath = `/3/${NODE_ENV}/${mediaId}?append_to_response=credits,recommendations,keywords`;
  } else {
    requestPath = `/3/${NODE_ENV}/${mediaId}`;
  }
  const options = {
    host: API_ENDPOINT,
    path: requestPath,
    port: 443,
    method: 'GET',
    headers: {'Authorization': `Bearer ${TMDB_READ_TOKEN}`},
  };

  let body = '';
  return new Promise((resolve, reject) => {
    const req = https.request(options, (res) => {
      logger.info('Request made to TMDB');
      logger.info('statusCode:', res.statusCode);
      logger.info('headers:', res.headers);

      res.on('data', (chunk) => {
        body += chunk;
      });
      res.on('end', () => {
        const responseBody = JSON.parse(body);
        resolve({'status': res.statusCode, 'body': responseBody});
      });
    });

    req.on('error', (e) => {
      console.error('Error querying TMDB: ' + e);
      reject(e);
    });

    req.end();
  });
}

async function genericTmdbQuery(mediaId, queryPath) {
  const options = {
    host: API_ENDPOINT,
    path: `${mediaId}/${queryPath}`,
    port: 443,
    method: 'GET',
    headers: {'Authorization': 'Bearer ' + TMDB_READ_TOKEN},
  };

  let body = '';
  return new Promise((resolve, reject) => {
    const req = https.request(options, (res) => {
      logger.info(`Request made to TMDB to get ${queryPath}`);
      logger.info('statusCode:', res.statusCode);
      logger.info('headers:', res.headers);

      res.on('data', (chunk) => {
        body += chunk;
      });
      res.on('end', () => {
        const responseBody = JSON.parse(body);
        resolve({'status': res.statusCode, 'body': responseBody});
      });
    });

    req.on('error', (e) => {
      console.error('Error querying TMDB: ' + e);
      reject(e);
    });

    req.end();
  });
}

async function getWatchProviders() {
  const options = {
    host: 'api.themoviedb.org',
    path: '/3/watch/providers/regions',
    port: 443,
    method: 'GET',
    headers: {'Authorization': 'Bearer ' + TMDB_READ_TOKEN},
  };

  let body = '';
  return new Promise((resolve, reject) => {
    const req = https.request(options, (res) => {
      logger.info('Request made to TMDB to get Keywords');
      logger.info('statusCode:', res.statusCode);
      logger.info('headers:', res.headers);

      res.on('data', (chunk) => {
        body += chunk;
      });
      res.on('end', () => {
        const responseBody = JSON.parse(body);
        resolve({'status': res.statusCode, 'body': responseBody});
      });
    });

    req.on('error', (e) => {
      console.error('Error querying TMDB: ' + e);
      reject(e);
    });

    req.end();
  });
}

async function tmdbSearch(searchQuery) {
  const parsedQuery = encodeURI(searchQuery);
  const options = {
    host: 'api.themoviedb.org',
    path: `/3/search/${NODE_ENV}?include_adult=false&page=1&query=${parsedQuery}`,
    port: 443,
    method: 'GET',
    headers: {'Authorization': 'Bearer ' + TMDB_READ_TOKEN},
  };

  let body = '';
  return new Promise((resolve, reject) => {
    const req = https.request(options, (res) => {
      logger.info('Request made to TMDB');
      logger.info('statusCode:', res.statusCode);
      logger.info('headers:', res.headers);

      res.on('data', (chunk) => {
        body += chunk;
      });
      res.on('end', () => {
        const responseBody = JSON.parse(body);
        resolve({'status': res.statusCode, 'body': responseBody});
      });
    });

    req.on('error', (e) => {
      console.error('Error querying TMDB: ' + e);
      reject(e);
    });

    req.end();
  });
}

async function getGenres() {
  const options = {
    host: 'api.themoviedb.org',
    path: `/3/genre/${NODE_ENV}/list`,
    port: 443,
    method: 'GET',
    headers: {'Authorization': 'Bearer ' + TMDB_READ_TOKEN},
  };

  let body = '';
  return new Promise((resolve, reject) => {
    const req = https.request(options, (res) => {
      logger.info('Request made to TMDB to get genres...');
      logger.info('statusCode:', res.statusCode);
      logger.info('headers:', res.headers);

      res.on('data', (chunk) => {
        body += chunk;
      });
      res.on('end', () => {
        const responseBody = JSON.parse(body);
        resolve({'status': res.statusCode, 'body': responseBody});
      });
    });

    req.on('error', (e) => {
      console.error('Error querying TMDB: ' + e);
      reject(e);
    });

    req.end();
  });
}

async function discoverSearch(searchQuery) {
  const options = {
    host: 'api.themoviedb.org',
    path: `/3/discover/${NODE_ENV}?${searchQuery}`,
    port: 443,
    method: 'GET',
    headers: {'Authorization': 'Bearer ' + TMDB_READ_TOKEN},
  };

  let body = '';
  return new Promise((resolve, reject) => {
    const req = https.request(options, (res) => {
      logger.info('Request made to TMDB');
      logger.info('statusCode:', res.statusCode);
      logger.info('headers:', res.headers);

      res.on('data', (chunk) => {
        body += chunk;
      });
      res.on('end', () => {
        const responseBody = JSON.parse(body);
        resolve({'status': res.statusCode, 'body': responseBody});
      });
    });

    req.on('error', (e) => {
      console.error('Error querying TMDB: ' + e);
      reject(e);
    });

    req.end();
  });
}

const getTvDirector = (mediaDetails) => {
  // A function to extract the director/creator for a TV show
  try {
    return mediaDetails.body.created_by[0].name;
  } catch (err) {
    logger.error(`No defined creator for show: ${mediaDetails.body.name}. Will use a directors`);
    mediaDetails.body.credits.crew.forEach(function(value) {
      if (value.job == 'Creator') {
        return value.id;
      }
    });
  }
  return '';
};


module.exports = {
  submitRatingService,
  getMediaDetails,
  tmdbSearch,
  getGenres,
  discoverSearch,
  getWatchProviders,
};
