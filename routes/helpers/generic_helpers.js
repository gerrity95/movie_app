var passwordValidator = require('password-validator');

var password_schema = new passwordValidator();
password_schema
    .is().min(8)                                    // Minimum length 8
    .is().max(100)                                  // Maximum length 100
    .has().uppercase()                              // Must have uppercase letters
    .has().lowercase()                              // Must have lowercase letters
    .has().digits(1)                                // Must have at least 1 digits

function isLoggedIn(req,res,next) {
    console.log("Checking if a user is logged in...")
    if(req.isAuthenticated()){
        return next();
    }
    else {
      console.log("No user is currently logged in.");
      return res.redirect('/login');
    }
  }

function existing_session(req) {
  if (req.user) {
    return req.user;
  }
  return false;

}

function isValidPassword(password) {
  var presult = password_schema.validate(password, { details: true });
  if (presult.length != 0) {
    return presult;
  }
  else {
    return true;
  }
};


function randomIntFromInterval(min, max) { // min and max included 
  return Math.floor(Math.random() * (max - min + 1) + min)
}

module.exports = {
    is_logged_in: isLoggedIn,
    existing_session: existing_session,
    is_valid_password: isValidPassword,
    random_number: randomIntFromInterval
}