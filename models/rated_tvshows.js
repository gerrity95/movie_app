//Import the mongoose module
var mongoose = require('mongoose');
const passportLocalMongoose = require("passport-local-mongoose");

//Define a schema
var Schema = mongoose.Schema;

const ratedSchema = new Schema({
  username: { type: String, default: null },
  rating: { type: Number, default: null },
  movie_id: { type: String, unique: true },
  genres: { type: Array, default: null},
  languages: { type: Array, default: null},
  tmdb_rating: { type: Number, default: null },
  networks: { type: Array, default: null},
  creator: { type: Array, default: null},
  last_name: { type: String, default: null}
});

ratedSchema.plugin(passportLocalMongoose);

// Compile model from schema
var ratedModel = mongoose.model('ratedSchema', ratedSchema );

module.exports = ratedModel