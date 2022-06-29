//Import the mongoose module
var mongoose = require('mongoose');
const passportLocalMongoose = require("passport-local-mongoose");

//Define a schema
var Schema = mongoose.Schema;

const reccsSchema = new Schema({
  user_id: { type: String, default: null },
  recommendations: { type: Array, default: null}, 
},
{ timestamps: true }
);

// Compile model from schema
var reccsModel = mongoose.model('recommended_movies', reccsSchema );

module.exports = reccsModel