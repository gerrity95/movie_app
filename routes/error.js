const express = require('express');
const async = require("async");
const helpers = require('./helpers/generic_helpers');
const router = express.Router();

router.get('*', async (req, res, next) => {
  	var user_info = helpers.existing_session(req);
	console.log("Error 404 request made on " + req.url);
	res.set("Connection", "close");
	res.status(404);
	res.render('404error', {user_info: user_info})
});

module.exports = router
