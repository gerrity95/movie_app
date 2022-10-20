const express = require('express');
const router = express.Router();

const moviesController = require('../controllers/movies.controller');
const genericHelpers = require('../utils/generic_helpers');

// GET method routes
router.get('/:movie_id', genericHelpers.isLoggedIn, moviesController.get_movie);
router.get('/user/watchlist', genericHelpers.isLoggedIn, moviesController.get_watchlist);

// POST method routes
router.post('/search', genericHelpers.isLoggedIn, moviesController.search);
router.post('/welcome/search', genericHelpers.isLoggedIn, moviesController.welcome_search);
router.post('/user/addwatchlist', genericHelpers.isLoggedIn, moviesController.add_watchlist);


module.exports = router;
