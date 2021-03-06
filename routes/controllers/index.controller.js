const indexService = require('../services/index.service');
const helpers = require('../helpers/generic_helpers');
const logger = require('../../config/logger');
const passport = require('passport');
const User = require('../../models/user');

exports.home = async function(req, res, next) {
  try {
    const userInfo = helpers.existing_session(req);
    res.render('home', {user_info: userInfo});
  } catch (err) {
    logger.error('Error attempting to render index page');
    logger.error(err);
    return next(err);
  }
};

exports.about = async function(req, res, next) {
  try {
    const userInfo = helpers.existing_session(req);
    res.render('about', {user_info: userInfo});
  } catch (err) {
    logger.error('Error attempting to render about page');
    logger.error(err);
    return next(err);
  }
};

exports.login = async function(req, res, next) {
  try {
    const userInfo = helpers.existing_session(req);
    res.render('login', {user_info: userInfo});
  } catch (err) {
    logger.error('Error attempting to render movie profile');
    logger.error(err);
    return next(err);
  }
};

exports.register = async function(req, res, next) {
  try {
    const userInfo = helpers.existing_session(req);
    res.render('register', {user_info: userInfo});
  } catch (err) {
    logger.error('Error attempting to render register page');
    logger.error(err);
    return next(err);
  }
};

exports.logout = async function(req, res, next) {
  try {
    req.logout();
    res.redirect('/');
  } catch (err) {
    logger.error('Error attempting to logout');
    logger.error(err);
    return next(err);
  }
};

exports.user_profile = async function(req, res, next) {
  try {
    const profileInfo = await indexService.getUserProfile(req);
    if (profileInfo.rated_movies < 5) {
      return res.redirect('/welcome');
    }
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
    if (profileInfo.rated_movies > 5) {
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
          throw (err);
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
    await User.register(new User({
      username: req.body.username,
      email: req.body.email,
      first_name: req.body.first_name,
      last_name: req.body.last_name}),
    req.body.password, function(err, user) {
      if (err) {
        console.log(err);
        const errMessage = indexService.handleRegisterError(err);
        return res.redirect(url + errMessage.fail_message);
      }
      logger.info('Successfully created user: ' + user.email);
      // helpers.generateEmailMessage(req);
      // await email.send_email(user.email, "Welcome To What To Watch ????", html_message);
      passport.authenticate('local')(req, res, function() {
        console.log('User successfully registered...');
        req.logIn(user, function(err) {
          if (err) {
            throw err;
          }
          console.log('Successfully logged in for user: ' + req.user.email);
          return res.redirect('/userprofile');
        });
      });
    });
  } catch (err) {
    logger.error('Error attempting to register...');
    logger.error(err);
    throw err;
  }
};
