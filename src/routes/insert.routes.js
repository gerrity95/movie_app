const express = require('express');
const router = express.Router();

const insertController = require('../controllers/insert.controller');

// GET method routes
// router.use (function (req, res, next) {
//   console.log('/' + req.method);
//   next();
// });

router.get('/watch_providers', insertController.watchProviders);

module.exports = router;
