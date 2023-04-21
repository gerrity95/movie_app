const statusService = require('../services/status.service');
const httpStatus = require('http-status');
const logger = require('../middlewares/logger');

exports.appStatus = async function(req, res, next) {
  try {
    const result = await statusService.getStatus();
    if (result !== 1) {
      throw new Error(httpStatus.INTERNAL_SERVER_ERROR, 'API is not in a healthy state');
    }
  } catch (err) {
    logger.error('Error attempting to establish API status');
    logger.error(err);
    throw new Error(httpStatus.INTERNAL_SERVER_ERROR, err);
  }
  logger.info('API is in a healthy state');
  res.status(httpStatus.OK).send('API is in a healthy state.');
};
