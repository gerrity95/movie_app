//Import the mongoose module
var mongoose = require('mongoose');
const passportLocalMongoose = require("passport-local-mongoose");

//Define a schema
var Schema = mongoose.Schema;

const watchlistSchema = new Schema({
  user_id: { type: String, default: null },
  movie_id: { type: Number, default: null },  
},
{ timestamps: true }
);

// Compile model from schema
var watchlistModel = mongoose.model('watchlist_movies', watchlistSchema );

module.exports = watchlistModel