const logger = require('../middlewares/logger');
const rater = require('../models/rated_movies');
const flaskApi = require('../utils/flask_api');
const dotenv = require('dotenv');
const https = require('https');

dotenv.config();

const {
  TMDB_READ_TOKEN,
} = process.env;

async function submitRatingService(req) {
  /**
   * Function to submit a rating and process it
   */
  try {
    const url = req.get('referer');
    const isRated = await isMovieRated(req, url);
    if (isRated.updated) {
      return isRated;
    }
    logger.info('Movie has not already been rated. Appending to movie ratings.');
    logger.info('Attempting to get movie details for: ' + req.body.movie_id);
    const movieDetails = await ratedMovieDetails(req);
    const submitRating = await submitMovieRating(req, movieDetails.movieDetails,
        movieDetails.directorId, movieDetails.movieKeywords, isRated.numRated, url);

    // Will attempt to generate reccs in background each time we add a new rating for improved performance
    if (submitRating.meet_requirements) {
      logger.info('Going to attempt to update the recommendations in the background...');
      flaskApi.get_reccomendations(req.user._id);
    }
    return submitRating;
  } catch (e) {
    logger.error('Error attempting to add show to the DB.');
    logger.error(e);
    return {'success': false, 'meet_requirements': false};
  }
}

async function isMovieRated(req, url) {
  /**
   * Function to identify if the movie has already been rated
   */
  try {
    logger.info('Checking count of rated movies to see if they\'ve passed the welcome period...');
    const ratedCount = await rater.find({
      'user_id': req.user._id,
    });
    const numRated = ratedCount.length;
    logger.info('Number of movies rated so far: ' + numRated);

    // Stop users from rating movies on the movie page before completing the welcome section
    if (!url.includes('welcome')) {
      if (numRated < 5) {
        logger.error('User tried to work around to the movie page before completing induction..');
        return {'success': false, 'meet_requirements': false,
          'numRated': numRated, 'updated': true};
      }
    }

    logger.info('Checking to see if already rated...');
    logger.info('Submitted rating: ' + req.body.rating + ' for movie: ' + req.body.movie_id);
    const isRated = await rater.findOne({
      'movie_id': req.body.movie_id,
      'user_id': req.user._id,
    });
    if (isRated) {
      if (url.includes('welcome')) {
        logger.info('Movie has already been rated. Must be a new movie during welcome initiaion');
        return {'success': false, 'is_rated': true, 'updated': true, 'numRated': numRated};
      }
      logger.info('Movie has already been rated. Updating the rating.');
      isRated.rating = req.body.rating;
      await isRated.save();
      return {'success': true, 'updated': true, 'numRated': numRated};
    }

    return {'updated': false, 'numRated': numRated};
  } catch (e) {
    logger.error('Error attempting to identify if a movie has already been rated');
    logger.error(e);
    throw e;
  }
}

async function ratedMovieDetails(req) {
  /**
   * Function to gather movie details needed for submitting a rating
   */
  try {
    const movieDetails = await get_movie_details(req.body.movie_id);
    if (movieDetails.status != 200) {
      logger.error('Unable to fulfill request to add movie to DB. Cannot get movie details');
      throw new Error('Unable to fulfill request to add movie to DB. Cannot get movie details');
    };

    const movieCast = await generic_tmdb_query(req.body.movie_id, 'credits');
    let directorId = '';
    for (const member in movieCast.body.cast) {
      if (movieCast.body.crew[member]['job'] == 'Director') {
        directorId = movieCast.body.crew[member].id;
        break;
      }
    }
    const movieKeywords = await generic_tmdb_query(req.body.movie_id, 'keywords');
    if (movieKeywords.status != 200) {
      logger.error('Unable to fulfill request to add movie to DB. Cannot get movie keywords');
      throw new Error('Unable to fulfill request to add movie to DB. Cannot get movie keywords');
    };
    return {'movieDetails': movieDetails, 'movieKeywords': movieKeywords,
      'movieCast': movieCast, 'directorId': directorId};
  } catch (e) {
    logger.error('Error attempting to gather details for movie when rating');
    logger.error(e);
    throw e;
  }
}

async function submitMovieRating(req, movieDetails, directorId, movieKeywords, numRated, url) {
  /**
   * Function to identify to submit rating for a given user
   */
  try {
    logger.info('Attempting to add show to DB...');
    const newShow = new rater({
      user_id: req.user._id,
      rating: req.body.rating,
      movie_id: req.body.movie_id,
      genres: movieDetails.body.genres,
      languages: movieDetails.body.original_language,
      tmdb_rating: movieDetails.body.vote_average,
      production_companies: movieDetails.body.production_companies,
      director: directorId,
      keywords: movieKeywords.body.keywords,
    });

    await rater.create(newShow);

    numRated = numRated + 1;
    logger.info('Number of movies rated so far: ' + numRated);
    if (url.includes('welcome')) {
      // If coming from welcome screen the user will get redirected to their profile once they've rated 5 movies.
      if (numRated >= 5) {
        logger.info('Enough movies rated to start getting recommendations...');
        return {'success': true, 'meet_requirements': true};
      } else {
        logger.info('Not enough movies rated to start generating recommendations.');
        return {'success': true, 'meet_requirements': false, 'num_rated': numRated};
      }
    }
    return {'success': true, 'meet_requirements': true, 'num_rated': numRated};
  } catch (e) {
    logger.error('Error attempting to submit rating');
    logger.error(e);
    throw e;
  }
}

async function get_movie_details(movieId) {
  const options = {
    host: 'api.themoviedb.org',
    path: '/3/movie/' + movieId,
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

async function generic_tmdb_query(movieId, queryPath) {
  const options = {
    host: 'api.themoviedb.org',
    path: '/3/movie/' + movieId + '/' + queryPath,
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

async function tmdb_search(searchQuery) {
  const parsedQuery = encodeURI(searchQuery);
  const options = {
    host: 'api.themoviedb.org',
    path: '/3/search/movie?include_adult=false&page=1&query=' + parsedQuery,
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

async function get_genres() {
  const options = {
    host: 'api.themoviedb.org',
    path: '/3/genre/movie/list',
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

async function discover_search(searchQuery) {
  const options = {
    host: 'api.themoviedb.org',
    path: '/3/discover/movie?' + searchQuery,
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


module.exports = {
  submitRatingService,
  get_movie_details,
  generic_tmdb_query,
  search_query: tmdb_search,
  get_genres,
  discover_search,
};
