const express = require('express');
const helpers = require('./helpers/generic_helpers');
const router = express.Router();

router.get('*', async (req, res, next) => {
  const userInfo = helpers.existing_session(req);
  console.log('Error 404 request made on ' + req.url);
  res.set('Connection', 'close');
  res.status(404);
  res.render('404error', {user_info: userInfo});
});

module.exports = router;
