const email = require('../../config/email');
const helpers = require('../helpers/generic_helpers');
const dotenv = require('dotenv');
dotenv.config();

async function contactPost(req) {
  const userInfo = helpers.existing_session(req);
  console.log('Attempting to submit contact form');
  await email.send_contact_email(req.body.subject, req.body.first_name,
      req.body.surname, req.body.email, req.body.text).then(
      function(data) {
        console.log('Mail sent. Data returned from Mail Client:');
        return {user_info: userInfo, success_mail: true};
      }).catch(
      function(err) {
        console.log('Error attempting to send contact for Session: ' + req.sessionID);
        console.log(err, err.stack);
        return {user_info: userInfo, success_mail: false};
      });
}

exports.modules = {
  contactPost,
};
