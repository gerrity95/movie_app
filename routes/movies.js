const express = require('express');
const router = express.Router();
const https = require('https');
const tmdb_api = require('./tmdb_api');
const helpers = require('./helpers/generic_helpers');
const watchlist_model = require('../models/movie_watchlist');
const flask_api = require('./helpers/flask_api');

router.get("/movies/:movie_id", helpers.is_logged_in, async (req,res) =>{
    console.log("PARAMS");
    console.log("Attempting to get movie detail for " + req.params.movie_id)
    let [is_watchlist, movie_info, movie_cast] = await Promise.all([
        watchlist_model.find({user_id: req.user._id, movie_id: req.params.movie_id}),
        tmdb_api.get_movie_details(req.params.movie_id),
        tmdb_api.generic_tmdb_query(req.params.movie_id, 'credits')
    ]).catch((err) => setImmediate(() => {
        console.log("Error attempting to get data for Movie " + req.params.movie_id);
        console.log(err);
        return next(err);
       }));
    director = ''
    screenplay = ''
    writer = ''
    try {
        movie_cast.body.crew.forEach(function(value){
            if (value.job == "Director") {
                director = value.name
            }
            if (value.job == "Screenplay") {
                screenplay = value.name
            }
            if (value.job == "Writer") {
                writer = value.name
            }
          });
    
    } catch (e) {
        console.log("Error: " + e + " attempting to get movie details")
        return res.render('error', {'error': e})
    }
    let watchlist_bool = false
    if (is_watchlist.length == 1) {
        watchlist_bool = true
    }
    return res.render("movie_profile", {'movie_info': movie_info.body, 'movie_credits': movie_cast.body,
                                        'director': director, 'screenplay': screenplay, 'writer': writer,
                                        'is_watchlist': watchlist_bool});
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

router.post('/user/addwatchlist', helpers.is_logged_in, async (req,res) =>{
    console.log("Attempting to Add movie to the watchlist...");
    console.log(req.body);
    console.log(req.user._id)
    let existing_watchlist = await watchlist_model.find({
        user_id: req.user._id,
        movie_id: req.body.movie_id
      });
    if (existing_watchlist.length != 0) {
        console.log("Movie has already been added to the watchlist for this user. Attempting to Remove...")
        let delete_watchlist = await watchlist_model.deleteOne({user_id: req.user._id, movie_id: req.body.movie_id});
        console.log(delete_watchlist)
        if (delete_watchlist.deletedCount == 1) {
            console.log("Succesfully deleted movie from watchlist")
            return res.json({"success": true, "removed": true});
        }
        console.log("Issue seen attempting to remove movie from watchlist...")
        return res.json({"success": false, "removed": true});
    }
    console.log("Movie not yet added to watchlist for user " + req.user._id + " attempting to add now.")
    const new_watchlist = new watchlist_model({
        user_id: req.user._id,
        movie_id: req.body.movie_id
    })
    let add_watchlist = await watchlist_model.create(new_watchlist)
    console.log(add_watchlist);
    return res.json({"success": true, "removed": false});
})

router.get("/user/watchlist", helpers.is_logged_in, async (req,res) =>{
    console.log("Attempting to render watchlist for user " + req.user._id);
    let watchlist_movies = await watchlist_model.find({user_id: req.user._id});
    console.log(watchlist_movies);
    rendered_watchlist = await flask_api.get_watchlist(req.user._id, watchlist_movies);
    console.log("Successfully got response back from server..");
    console.log(rendered_watchlist);
    return res.render("watchlist")
});


module.exports = router;