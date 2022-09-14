const presetService = require('../services/password_reset.service');
const logger = require('../middlewares/logger');

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
    const pwordUpdate = await presetService.passwordUpdate(req);
    if (pwordUpdate.status == 200) {
      return res.render('password_reset', pwordUpdate);
    }
    return res.send(pwordUpdate);
  } catch (err) {
    logger.error('Error attempting to render password update page');
    logger.error(err);
    return next(err);
  }
};

exports.password_reset_post = async function(req, res, next) {
  try {
    const url = req.get('referer').split('?')[0];
    const pwordReset = await presetService.passwordResetBack(req);
    return res.redirect(url + pwordReset.message);
  } catch (err) {
    logger.error('Error attempting to make password reset request');
    logger.error(err);
    return next(err);
  }
};

exports.password_update_post = async function(req, res, next) {
  try {
    const pwordUpdate = await presetService.passwordUpdateBack(req);
    if (pwordUpdate.status == 200) {
      return res.redirect('/login?password_reset=True');
    } else if (pwordUpdate.status == 401) {
      return res.render('password_reset', pwordUpdate);
    }
    return res.status(pwordUpdate.status).send(pwordUpdate.message);
  } catch (err) {
    logger.error('Error attempting to render movie profile');
    logger.error(err);
    return next(err);
  }
};
