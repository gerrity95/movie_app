const express = require('express');
const router = express.Router();
const presetController = require('../controllers/password_reset.controller');

// GET method routes
router.get('/password_reset', presetController.password_reset);
router.get('/:userId/:token', presetController.password_update);

// POST method routes
router.post('/password_reset', presetController.password_reset_post);
router.post('/:userId/:token', presetController.password_update_post);


module.exports = {
  router: router,
};
