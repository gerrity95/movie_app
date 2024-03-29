// Import the mongoose module
const mongoose = require('mongoose');

// Define a schema
const Schema = mongoose.Schema;

const ratedSchema = new Schema({
  user_id: {type: String, default: null},
  rating: {type: Number, default: null},
  movie_id: {type: Number, default: null},
  genres: {type: Array, default: null},
  languages: {type: Array, default: null},
  tmdb_rating: {type: Number, default: null},
  production_companies: {type: Array, default: null},
  director: {type: String, default: null},
  keywords: {type: Array, default: null},

},
{timestamps: true},
);

// Compile model from schema
const ratedModel = mongoose.model('rated_movies', ratedSchema );

module.exports = ratedModel;
