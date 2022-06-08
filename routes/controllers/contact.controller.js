const contact_service = require('../services/contact.service');
const logger = require('../../config/logger');
const helpers = require('../helpers/generic_helpers');

exports.contact = async function(req, res, next) {
  try {
    const user_info = helpers.existing_session(req);
    res.render('contact', {user_info: user_info});
  } catch (err) {
    logger.error('Error attempting to render contact page');
    logger.error(err);
    return next(err);
  }
};


exports.contact_post = async function(req, res, next) {
  try {
    const contact_post = await contact_service.contactPost(req);
    return res.render('contact', contact_post);
  } catch (err) {
    logger.error('Error attempting to send contact message');
    logger.error(err);
    return next(err);
  }
};
