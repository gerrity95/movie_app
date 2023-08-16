const express = require('express');
const router = express.Router();

const mediaController = require('../controllers/media.controller');
const genericHelpers = require('../utils/generic_helpers');

// GET method routes
router.get('/:media_id', genericHelpers.isLoggedIn, mediaController.getMedia);
router.get('/user/watchlist', genericHelpers.isLoggedIn, mediaController.get_watchlist);

// POST method routes
router.post('/search', genericHelpers.isLoggedIn, mediaController.search);
router.post('/welcome/search', genericHelpers.isLoggedIn, mediaController.welcome_search);
router.post('/user/addwatchlist', genericHelpers.isLoggedIn, mediaController.add_watchlist);
router.post('/user/addblocklist', genericHelpers.isLoggedIn, mediaController.add_blocklist);


module.exports = router;
