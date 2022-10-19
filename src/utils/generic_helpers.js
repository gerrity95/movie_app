const passwordValidator = require('password-validator');
const https = require('https');
const dotenv = require('dotenv');
const logger = require('../middlewares/logger');
dotenv.config();

const {
  IP_INFO_KEY,
} = process.env;


const passwordSchema = new passwordValidator();
passwordSchema
    .is().min(8) // Minimum length 8
    .is().max(100) // Maximum length 100
    .has().uppercase() // Must have uppercase letters
    .has().lowercase() // Must have lowercase letters
    .has().digits(1); // Must have at least 1 digits

function isLoggedIn(req, res, next) {
  logger.info('Checking if a user is logged in...');
  if (req.isAuthenticated()) {
    return next();
  } else {
    logger.info('No user is currently logged in.');
    return res.redirect('/login');
  }
}

function isValidPassword(password) {
  const presult = passwordSchema.validate(password, { details: true });
  if (presult.length != 0) {
    return presult;
  } else {
    return true;
  }
};


function randomIntFromInterval(min, max) { // min and max included
  return Math.floor(Math.random() * (max - min + 1) + min);
}

async function getIPInfo() {
  const options = {
    host: 'ipinfo.io',
    port: 443,
    method: 'GET',
    headers: {'Authorization': 'Bearer ' + IP_INFO_KEY},
  };

  let body = '';
  return new Promise((resolve, reject) => {
    const req = https.request(options, (res) => {
      console.log('Request made to IPINFO');
      console.log('statusCode:', res.statusCode);
      console.log('headers:', res.headers);

      res.on('data', (chunk) => {
        body += chunk;
      });
      res.on('end', () => {
        const responseBody = JSON.parse(body);
        resolve({'status': res.statusCode, 'body': responseBody});
      });
    });

    req.on('error', (e) => {
      console.error('Error querying IPINFO: ' + e);
      reject(e);
    });

    req.end();
  });
}

function generateEmailMessage(req) {
  const htmlMessage = `
        <center><img style="width:300px;height:168px" src="https://whattowatchmovies.co/images/what_to_watch_black.png"></center><br><br>
        Dear ${req.body.first_name} ${req.body.last_name},<br><br><p>Welcome to What To Watch! This is the only place you'll need to go to find out what movies you'll love. 
        Once you login you'll be asked to rate some movies to get started so we can get a baseline on exactly what you like to watch. It should only take a minute or so as we only need 5 movies to get started!</p><br>
        <p>If you would like to find out a little bit more about how What To Watch works you can read <a href="${process.env.BASE_URL}/about" target="_blank">about us here.</a></p>
        <p>If you would like to get in contact with us you can <a href="${process.env.BASE_URL}/contact" target="_blank">follow this link here.</a></p><br><p>Many Thanks for using What To Watch</p><br>`;

  return htmlMessage;
}

function generateResetEmail(user, token) {
  const htmlMessage = `
  <center><img style="width:300px;height:168px" src="https://whattowatchmovies.co/images/what_to_watch_black.png"></center><br><br>
  Dear ${user.first_name} ${user.last_name},<br><br><p>A request to reset your password has been made. 
  If you want to reset your password you can <a href="${process.env.BASE_URL}/${user._id}/${token.token}" target="_blank">
  reset it here.</a></p><br><p><b>Please note</b> For security reasons this link will expire after 2 hours. If you do not reset
  before then, you will need to try again.</p><br><p>If the above link isn't
  working you can paste the following link into your address bar: 
  <a href="${process.env.BASE_URL}/${user._id}/${token.token}" target="_blank">${process.env.BASE_URL}/${user._id}/${token.token}</a></p><br><p>Many Thanks for using What To Watch</p><br>`;

  return htmlMessage;
}

module.exports = {
  isLoggedIn,
  is_valid_password: isValidPassword,
  random_number: randomIntFromInterval,
  get_ip_info: getIPInfo,
  generateEmailMessage,
  generateResetEmail,
};
