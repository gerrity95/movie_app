const express = require('express');
const router = express.Router();
const path = require('path');
const rater = require('../../models/rated_movies');
const passport = require('passport');
const passportLocalMongoose = require('passport-local-mongoose');
const dotenv = require('dotenv');
const async = require('async');
const http = require('http');
dotenv.config();

const {
  FLASK_HOST,
  FLASK_PORT,
} = process.env;


async function flask_test() {
  const request_data = {'Hello': 'Mark'};
  const options = {
    host: `${FLASK_HOST}`,
    path: '/param_test',
    port: `${FLASK_PORT}`,
    method: 'POST',
    headers: {
      'content-type': 'application/json',
    },
  };

  let body = '';
  return new Promise((resolve, reject) => {
    const req = http.request(options, (res) => {
      console.log('Request made to Flask API.');
      console.log('statusCode:', res.statusCode);
      console.log('headers:', res.headers);

      res.on('data', (chunk) => {
        body += chunk;
      });
      res.on('end', () => {
        try {
          response_body = JSON.parse(body);
          resolve({'status': res.statusCode, 'body': response_body});
        } catch (error) {
          console.log('Error: ' + error + ' attempting to parse response from FLASK API.');
          resolve({'status': res.statusCode, 'body': body});
        }
      });
    });

    req.on('error', (e) => {
      console.error('Error queryinwg Flask Server: ' + e);
      reject(e);
    });

    req.write(JSON.stringify(request_data));
    req.end();
  });
}

async function get_reccomendations(user_id) {
  const request_data = {'user_id': user_id};
  const options = {
    host: `${FLASK_HOST}`,
    path: '/get_reccomendations',
    port: `${FLASK_PORT}`,
    method: 'POST',
    headers: {
      'content-type': 'application/json',
    },
  };
  console.log('Processing request against backend...');
  let body = '';
  return new Promise((resolve, reject) => {
    const req = http.request(options, (res) => {
      console.log('Request made to Flask API.');
      console.log('statusCode:', res.statusCode);
      console.log('headers:', res.headers);

      res.on('data', (chunk) => {
        body += chunk;
      });
      res.on('end', () => {
        try {
          response_body = JSON.parse(body);
          resolve({'status': res.statusCode, 'body': response_body});
        } catch (error) {
          console.log('Error: ' + error + ' attempting to parse response from FLASK API.');
          resolve({'status': res.statusCode, 'body': body});
        }
      });
    });

    req.on('error', (e) => {
      console.error('Error querying Flask Server: ' + e);
      reject(e);
    });

    req.write(JSON.stringify(request_data));
    req.end();
  });
}

async function get_watchlist(user_id, movie_list) {
  const request_data = {'user_id': user_id, 'movie_list': movie_list};
  const options = {
    host: `${FLASK_HOST}`,
    path: '/get_watchlist',
    port: `${FLASK_PORT}`,
    method: 'POST',
    headers: {
      'content-type': 'application/json',
    },
  };
  console.log('Processing request against backend...');
  let body = '';
  return new Promise((resolve, reject) => {
    const req = http.request(options, (res) => {
      console.log('Request made to Flask API.');
      console.log('statusCode:', res.statusCode);
      console.log('headers:', res.headers);

      res.on('data', (chunk) => {
        body += chunk;
      });
      res.on('end', () => {
        try {
          response_body = JSON.parse(body);
          resolve({'status': res.statusCode, 'body': response_body});
        } catch (error) {
          console.log('Error: ' + error + ' attempting to parse response from FLASK API.');
          resolve({'status': res.statusCode, 'body': body});
        }
      });
    });

    req.on('error', (e) => {
      console.error('Error querying Flask Server: ' + e);
      reject(e);
    });

    req.write(JSON.stringify(request_data));
    req.end();
  });
}


module.exports = {
  flask_test: flask_test,
  get_reccomendations: get_reccomendations,
  get_watchlist: get_watchlist,
};
