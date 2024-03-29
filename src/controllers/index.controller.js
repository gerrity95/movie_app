const indexService = require('../services/index.service');
const helpers = require('../utils/generic_helpers');
const logger = require('../middlewares/logger');
const passport = require('passport');
const User = require('../models/user');
const dotenv = require('dotenv');
dotenv.config();
const {NODE_ENV} = process.env;

exports.home = async function(req, res, next) {
  try {
    if (req.isAuthenticated()) {
      const redirect = await indexService.profileRedirect(req);
      if (redirect.status === 'welcome') {
        return res.redirect('/welcome');
      }
      return res.render('user_profile', redirect.userProfile);
    }
    if (NODE_ENV === 'tv') {
      return res.render('home_tv', {user_info: req.user});
    }
    return res.render('home', {user_info: req.user});
  } catch (err) {
    logger.error('Error attempting to render index page');
    logger.error(err);
    return next(err);
  }
};

exports.about = async function(req, res, next) {
  try {
    if (NODE_ENV === 'tv') {
      return res.render('about_tv', {user_info: req.user});
    }
    return res.render('about', {user_info: req.user});
  } catch (err) {
    logger.error('Error attempting to render about page');
    logger.error(err);
    return next(err);
  }
};

exports.login = async function(req, res, next) {
  try {
    if (req.isAuthenticated()) {
      const redirect = await indexService.profileRedirect(req);
      if (redirect.status === 'welcome') {
        return res.redirect('/welcome');
      }
      return res.render('user_profile', redirect.userProfile);
    }
    res.render('login', {user_info: req.user});
  } catch (err) {
    logger.error('Error attempting to render movie profile');
    logger.error(err);
    return next(err);
  }
};

exports.register = async function(req, res, next) {
  try {
    if (req.isAuthenticated()) {
      const redirect = await indexService.profileRedirect(req);
      if (redirect.status === 'welcome') {
        return res.redirect('/welcome');
      }
      return res.render('user_profile', redirect.userProfile);
    }
    res.render('register', {user_info: req.user});
  } catch (err) {
    logger.error('Error attempting to render register page');
    logger.error(err);
    return next(err);
  }
};

exports.logout = async function(req, res, next) {
  req.logout(function(err) {
    if (err) {
      return next(err);
    }
    res.redirect('/');
  });
};

exports.user_profile = async function(req, res, next) {
  try {
    const profileInfo = await indexService.getUserProfile(req);
    return res.render('user_profile', profileInfo.data);
  } catch (err) {
    logger.error('Error attempting to render user profile');
    logger.error(err);
    return next(err);
  }
};

exports.user_profile_ajax = async function(req, res, next) {
  try {
    const userProfile = await indexService.getUserProfileAjax(req);
    return res.json(userProfile);
  } catch (err) {
    logger.error('Error attempting to render user profile through ajax');
    logger.error(err);
    return next(err);
  }
};

exports.welcome = async function(req, res, next) {
  try {
    const profileInfo = await indexService.getWelcome(req);
    if (profileInfo.rated_media >= 5) {
      return res.redirect('/userprofile');
    }
    return res.render('welcome', profileInfo.data);
  } catch (err) {
    logger.error('Error attempting to render user profile');
    logger.error(err);
    return next(err);
  }
};

exports.login_post = async function(req, res, next) {
  /* I cannot for some reason extract this logic to a separate function */
  try {
    logger.info('Attempting to login..');
    const url = req.get('referer').split('?')[0];
    passport.authenticate('local', function(err, user, info) {
      logger.info('Attempted login from: ' + url);
      if (err) {
        logger.info('Error: ' + err + ' when attempting to login');
        return res.redirect(url + '?failed_login=True');
      }

      if (!user) {
        logger.info('Authentication problem. Email/Password is incorrect');
        return res.redirect(url + '?failed_login=True');
      }
      req.logIn(user, function(err) {
        if (err) {
          throw err;
        }
        logger.info('Successfully logged in for user: ' + req.user.email);
        return res.redirect('/userprofile');
      });
    })(req, res, next);
  } catch (err) {
    logger.error('Error attempting to login');
    logger.error(err);
    return next(err);
  }
};

exports.register_post = async function(req, res, next) {
  /* I cannot for some reason extract this logic to a separate function */
  try {
    const url = req.get('referer').split('?')[0];
    const isValidPword = helpers.is_valid_password(req.body.password);
    if (isValidPword !== true) {
      logger.info('Password does not meet requirements.');
      return {fail_message: isValidPword};
    }
    await User.register(
        new User({
          username: req.body.email,
          email: req.body.email,
          first_name: req.body.first_name,
          last_name: req.body.last_name,
        }),
        req.body.password,
        function(err, user) {
          if (err) {
            console.log(err);
            const errMessage = indexService.handleRegisterError(err);
            return res.redirect(url + errMessage.fail_message);
          }
          logger.info('Successfully created user: ' + user.email);
          // helpers.generateEmailMessage(req);
          // await email.send_email(user.email, "Welcome To What To Watch 🍿", html_message);
          try {
            logger.info('User successfully registered... Attempting to login');
            passport.authenticate('local'), (req, res, function() {
              req.logIn(user, function(err) {
                if (err) {
                  throw err;
                }
                logger.info('Successfully logged in for user: ' + req.user.email);
                return res.redirect('/userprofile');
              });
            })(req, res, next);
          } catch (err) {
            logger.error('Error attempting to login');
            logger.error(err);
            throw err;
          }
        },
    );
  } catch (err) {
    logger.error('Error attempting to register...');
    logger.error(err);
    throw err;
  }
};
