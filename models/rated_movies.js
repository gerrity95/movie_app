//Import the mongoose module
var mongoose = require('mongoose');
const passportLocalMongoose = require("passport-local-mongoose");

//Define a schema
var Schema = mongoose.Schema;

const ratedSchema = new Schema({
  user_id: { type: String, default: null },
  rating: { type: Number, default: null },
  movie_id: { type: Number, default: null },
  genres: { type: Array, default: null},
  languages: { type: Array, default: null},
  tmdb_rating: { type: Number, default: null },
  production_companies: { type: Array, default: null},
  director: { type: Array, default: null},
  keywords: { type: Array, default: null}
});

// Compile model from schema
var ratedModel = mongoose.model('rated_movies', ratedSchema );

module.exports = ratedModel