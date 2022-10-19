const express = require('express');
const router = express.Router();

const tmdbapiController = require('../controllers/tmdbapi.controller');
const genericHelpers = require('../utils/generic_helpers');

// GET method routes
router.get('/recommended_shows', genericHelpers.isLoggedIn,
    tmdbapiController.recommended_shows);

// POST method routes
router.post('/submit_rating', genericHelpers.isLoggedIn, tmdbapiController.submit_rating);


module.exports = router;
