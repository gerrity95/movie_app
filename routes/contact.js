const express = require('express');
const router = express.Router();
const email = require('../config/email');
const helpers = require('./helpers/generic_helpers');
const email_transporter = email.transporter;
const dotenv = require('dotenv');
dotenv.config();

router.get("/contact", (req,res) =>{
    var user_info = helpers.existing_session(req);
    res.render("contact", {user_info: user_info});
  })

router.post('/contact', async(req, res) => {
    var user_info = helpers.existing_session(req);
    console.log("Attempting to submit contact form");
    var referer = req.get('referer')
    console.log("Request body: ");
    console.log(req.body);

    var sendPromise = email.send_contact_email(req.body.subject, req.body.first_name, 
        req.body.surname, req.body.email, req.body.text).then(
      function(data) {
        console.log('Mail sent. Data returned from Mail Client:');
        console.log(data);
        res.render('contact', {user_info: user_info, success_mail: true});
      }).catch(
        function(err) {
        console.log("Error attempting to send contact for Session: " + req.sessionID);
        console.log(err, err.stack);
        res.render('contact', {user_info: user_info, success_mail: false});
      });
});

module.exports = router