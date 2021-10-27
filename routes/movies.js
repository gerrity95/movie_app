const express = require('express');
const router = express.Router();
const https = require('https');
const tmdb_api = require('./tmdb_api');

function isLoggedIn(req,res,next) {
    if(req.isAuthenticated()){
        console.log(req)
        return next();
    }
  }

router.get("/movies/:movie_id", isLoggedIn, async (req,res) =>{
    console.log("PARAMS");
    console.log("Attempting to get movie detail for " + req.params.movie_id)
    let [movie_info, movie_cast] = await Promise.all([
        tmdb_api.get_movie_details(req.params.movie_id),
        tmdb_api.generic_tmdb_query(req.params.movie_id, 'credits')
    ]).catch((err) => setImmediate(() => {
        console.log("Error attempting to get data for hub " + hub_id);
        console.log(err);
        return next(err);
       }));
    movie_cast.body.crew.forEach(function(value){
        if (value.job == "Director") {
            director = value.name
        }
        if (value.job == "Screenplay") {
            screenplay = value.name
        }
      });
    return res.render("movie_profile", {'movie_info': movie_info.body, 'movie_credits': movie_cast.body,
                                        'director': director, 'screenplay': screenplay});
  })


module.exports = router;