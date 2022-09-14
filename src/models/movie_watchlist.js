// Import the mongoose module
const mongoose = require('mongoose');

// Define a schema
const Schema = mongoose.Schema;

const watchlistSchema = new Schema({
  user_id: {type: String, default: null},
  movie_id: {type: Number, default: null},
},
{timestamps: true},
);

// Compile model from schema
const watchlistModel = mongoose.model('watchlist_movies', watchlistSchema );

module.exports = watchlistModel;
