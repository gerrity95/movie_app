const contactService = require('../services/contact.service');
const logger = require('../middlewares/logger');

exports.contact = async function(req, res, next) {
  try {
    res.render('contact', {user_info: req.user});
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
