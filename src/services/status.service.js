const logger = require('../middlewares/logger');
const {default: mongoose} = require('mongoose');

const getStatus = () => {
  logger.info('Verifying status of API');
  return mongoose.connection.readyState;
};

module.exports = {
  getStatus,
};
