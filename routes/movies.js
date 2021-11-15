const express = require('express');
const router = express.Router();
const https = require('https');
const tmdb_api = require('./tmdb_api');
const helpers = require('./helpers/generic_helpers');

router.get("/movies/:movie_id", helpers.is_logged_in, async (req,res) =>{
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
    director = ''
    screenplay = ''
    try {
        movie_cast.body.crew.forEach(function(value){
            if (value.job == "Director") {
                director = value.name
            }
            if (value.job == "Screenplay") {
                screenplay = value.name
            }
          });
    
    } catch (e) {
        console.log("Error: " + e + " attempting to get movie details")
        return res.render('error', {'error': e})
    }
    return res.render("movie_profile", {'movie_info': movie_info.body, 'movie_credits': movie_cast.body,
                                        'director': director, 'screenplay': screenplay});
  })

router.post('/search', helpers.is_logged_in, async (req,res) =>{
    console.log("Attempting to search...");
    console.log(req.body);
    let search_result = await tmdb_api.search_query(req.body.search)
    console.log(search_result.body.results)
    return res.render('search', {'results': search_result.body.results, 'query': req.body.search})
})

router.post('/welcome/search', helpers.is_logged_in, async (req,res) =>{
    console.log("Attempting to search...");
    console.log(req.body);
    let search_result = await tmdb_api.search_query(req.body.search)
    return res.json({'results': search_result.body.results, 'query': req.body.search})
})


module.exports = router;