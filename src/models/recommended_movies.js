// Import the mongoose module
const mongoose = require('mongoose');
const passportLocalMongoose = require('passport-local-mongoose');

// Define a schema
const Schema = mongoose.Schema;

const reccsSchema = new Schema({
  user_id: {type: String, default: null},
  recommendations: {type: Array, default: null},
},
{timestamps: true},
);

// Compile model from schema
const reccsModel = mongoose.model('recommended_movies', reccsSchema );

module.exports = reccsModel;
