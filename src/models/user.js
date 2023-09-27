// Import the mongoose module
const mongoose = require('mongoose');
const passportLocalMongoose = require('passport-local-mongoose');

const userSchema = new mongoose.Schema({
  username: {type: String, default: null, unique: true, lowercase: true},
  password: {type: String, default: null},
  email: {type: String, unique: true},
  first_name: {type: String, default: null},
  last_name: {type: String, default: null},
});

userSchema.plugin(passportLocalMongoose);

userSchema.plugin(passportLocalMongoose, {usernameQueryFields: ['email']});

// Compile model from schema
const UserModel = mongoose.model('UserModel', userSchema );

module.exports = UserModel;
