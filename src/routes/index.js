const express = require('express');
const homeRouter = require('./home.routes');
const errorRouter = require('./error.routes');
const contactRouter = require('./contact.routes');
const insertRouter = require('./insert.routes');
const movieRouter = require('./movies.routes');
const tmdbApiRouter = require('./tmdb_api.routes');
const resetRouter = require('./reset.routes');

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
    path: '/movies',
    route: movieRouter,
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
