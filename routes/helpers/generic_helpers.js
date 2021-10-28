function isLoggedIn(req,res,next) {
    console.log("Checking if a user is logged in...")
    if(req.isAuthenticated()){
        console.log(req);
        return next();
    }
    else {
      console.log("No user is currently logged in.");
      return res.redirect('/login');
    }
  }

module.exports = {
    is_logged_in: isLoggedIn
}