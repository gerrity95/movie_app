const mongoose = require('mongoose');
const Schema = mongoose.Schema;

const watchProvidersSchema = new Schema({
  iso_3166_1: {
    type: String,
    required: true,
  },
  english_name: {
    type: String,
    required: true,
  },
  native_name: {
    type: String,
    required: true,
  },
});

module.exports = mongoose.model('watch_providers', watchProvidersSchema);
