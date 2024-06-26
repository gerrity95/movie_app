const express = require('express');
const router = express.Router();

const indexController = require('../controllers/index.controller');
const genericHelpers = require('../utils/generic_helpers');

router.get('/', indexController.home);
router.get('/about', indexController.about);
router.get('/login', indexController.login);
router.get('/register', indexController.register);
router.get('/logout', indexController.logout);

router.get('/userprofile',
    [genericHelpers.isLoggedIn, genericHelpers.enoughMediaRated],
    indexController.user_profile);
router.get('/user/userprofile',
    [genericHelpers.ajaxIsLoggedIn, genericHelpers.enoughMediaRated],
    indexController.user_profile_ajax);
router.get('/welcome', genericHelpers.isLoggedIn, indexController.welcome);

// POST method routes
router.post('/login', indexController.login_post);
router.post('/register', indexController.register_post);

module.exports = router;
