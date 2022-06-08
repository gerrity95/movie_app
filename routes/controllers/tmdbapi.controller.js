const tmdbapi_service = require('../services/tmdbapi.service');
const logger = require('../../config/logger');
const flask_api = require('../helpers/flask_api');

exports.recommended_shows = async function(req, res, next) {
  try {
    shows = await flask_api.get_reccomendations(req.user._id);
    return res.json({'result': shows});
  } catch (err) {
    logger.error('Error attempting to get recommended shows');
    logger.error(err);
    return next(err);
  }
};

exports.submit_rating = async function(req, res, next) {
  try {
    result = await tmdbapi_service.submitRatingService(req);
    return res.send(result);
  } catch (err) {
    logger.error('Error attempting to get recommended shows');
    logger.error(err);
    return next(err);
  }
};
