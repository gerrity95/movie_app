// Import the mongoose module
const mongoose = require('mongoose');

// Define a schema
const Schema = mongoose.Schema;

const watchlistSchema = new Schema({
  user_id: {type: String, default: null},
  tv_id: {type: Number, default: null},
},
{timestamps: true},
);

// Compile model from schema
const televisionWatchlist = mongoose.model('watchlist_television', watchlistSchema );

module.exports = televisionWatchlist;
