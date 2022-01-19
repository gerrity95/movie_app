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

module.exports = {
    is_logged_in: isLoggedIn,
    existing_session: existing_session
}