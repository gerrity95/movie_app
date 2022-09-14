const logger = require('../middlewares/logger');
const {getWatchProviders} = require('./tmdbapi.service');
const watchProvidersModel = require('../models/watch_providers');

async function watchProviders() {
  logger.info('Attempting to insert watch providers');
  try {
    const providers = await getWatchProviders();
    if (providers.status !== 200) {
      logger.info('Successfully got watch providers. Inserting them into DB.');
      await watchProvidersModel.insertMany(providers.body.results);
    } else {
      logger.error(`Error attempting to get watch providers with status: ${providers.status}`);
      throw new Error('Error attempting to get watch providers');
    }
  } catch (err) {
    logger.error('Error attempting to populate watch providers');
    logger.error(err);
    throw err;
  }
  return true;
};

module.exports = {
  watchProviders,
};
