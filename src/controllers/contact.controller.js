const contactService = require('../services/contact.service');
const logger = require('../middlewares/logger');
const helpers = require('../utils/generic_helpers');

exports.contact = async function(req, res, next) {
  try {
    const userInfo = helpers.existing_session(req);
    res.render('contact', {user_info: userInfo});
  } catch (err) {
    logger.error('Error attempting to render contact page');
    logger.error(err);
    return next(err);
  }
};


exports.contact_post = async function(req, res, next) {
  try {
    const contactPost = await contactService.contactPost(req);
    return res.render('contact', contactPost);
  } catch (err) {
    logger.error('Error attempting to send contact message');
    logger.error(err);
    return next(err);
  }
};
