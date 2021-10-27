const express = require('express');
const async = require("async");
const router = express.Router();

router.get('*', async (req, res, next) => {
	  console.log("Error 404 request made on " + req.url);
	  res.set("Connection", "close");
	  res.status(404);
	  res.render('404error')
});

module.exports = router
