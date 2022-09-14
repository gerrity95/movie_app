const insertService = require('../services/insert.service');
const logger = require('../middlewares/logger');

exports.watchProviders = async function(req, res, next) {
  try {
    const insertWatchProviders = await insertService.watchProviders();
    res.send(insertWatchProviders);
  } catch (err) {
    logger.error('Error attempting to insert watch providers');
    logger.error(err);
    return next(err);
  }
};
