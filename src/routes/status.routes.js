const express = require('express');
const router = express.Router();
const controller = require('../controllers/status.controller');

router.get('/', controller.appStatus);

module.exports = router;
