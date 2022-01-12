//Import the mongoose module
var mongoose = require('mongoose');
const passportLocalMongoose = require("passport-local-mongoose");

//Define a schema
var Schema = mongoose.Schema;

const userSchema = new mongoose.Schema({
  username: { type: String, default: null, unique: true, lowercase: true},
  password: { type: String, default: null },
  email: { type: String, unique: true },
  first_name: { type: String, default: null},
  last_name: { type: String, default: null}
});

userSchema.plugin(passportLocalMongoose);

// Compile model from schema
var UserModel = mongoose.model('UserModel', userSchema );

module.exports = UserModel