const preset_service = require('../services/password_reset.service');
const logger = require('../../config/logger');

exports.password_reset = async function(req, res, next) {
  try {
    res.render('password_forget');
  } catch (err) {
    logger.error('Error attempting to render password forget page');
    logger.error(err);
    return next(err);
  }
};

exports.password_update = async function(req, res, next) {
  try {
    const pword_update = await preset_service.passwordUpdate(req);
    if (pword_update.status == 200) {
      return res.render('password_reset', pword_update);
    }
    return res.send(pword_update);
  } catch (err) {
    logger.error('Error attempting to render password update page');
    logger.error(err);
    return next(err);
  }
};

exports.password_reset_post = async function(req, res, next) {
  try {
    const url = req.get('referer').split('?')[0];
    const pword_reset = await preset_service.passwordResetBack(req);
    return res.redirect(url + pword_reset.message);
  } catch (err) {
    logger.error('Error attempting to make password reset request');
    logger.error(err);
    return next(err);
  }
};

exports.password_update_post = async function(req, res, next) {
  try {
    const pword_update = await preset_service.passwordUpdateBack(req);
    if (pword_update.status == 200) {
      return res.redirect('/login?password_reset=True');
    } else if (pword_update.status == 401) {
      return res.render('password_reset', pword_update);
    }
    return res.status(pword_update.status).send(pword_update.message);
  } catch (err) {
    logger.error('Error attempting to render movie profile');
    logger.error(err);
    return next(err);
  }
};
