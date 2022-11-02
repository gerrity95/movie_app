// Import the mongoose module
const mongoose = require('mongoose');

// Define a schema
const Schema = mongoose.Schema;

const reccsSchema = new Schema({
  user_id: {type: String, default: null},
  recommendations: {type: Array, default: null},
},
{timestamps: true},
);

// Compile model from schema
const televisionReccs = mongoose.model('recommended_television', reccsSchema );

module.exports = televisionReccs;
