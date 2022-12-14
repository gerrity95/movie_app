const express = require('express');
const homeRouter = require('./home.routes');
const errorRouter = require('./error.routes');
const contactRouter = require('./contact.routes');
const insertRouter = require('./insert.routes');
const mediaRouter = require('./media.routes');
const tmdbApiRouter = require('./tmdb_api.routes');
const resetRouter = require('./reset.routes');
const dotenv = require('dotenv');
dotenv.config();
const {
  NODE_ENV,
} = process.env;


const router = express.Router();


const defaultRoutes = [
  {
    path: '/',
    route: homeRouter,
  },
  // {
  //   path: '/error',
  //   route: errorRouter,
  // },
  {
    path: '/contact',
    route: contactRouter,
  },
  {
    path: '/insert',
    route: insertRouter,
  },
  {
    path: `/media`,
    route: mediaRouter,
  },
  {
    path: '/tmdbapi',
    route: tmdbApiRouter,
  },
  {
    path: '/reset',
    route: resetRouter,
  },
];

defaultRoutes.forEach((route) => {
  router.use(route.path, route.route);
});

router.get('*', async (req, res, next) => {
  console.log('Error 404 request made on ' + req.url);
  res.set('Connection', 'close');
  res.status(404);
  res.render('404error', {user_info: req.user});
});


module.exports = router;
