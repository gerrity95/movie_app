const express = require('express');
const router = express.Router();
const path = require('path');
const rater = require("../../models/rated_tvshows")
const passport = require("passport");
const passportLocalMongoose = require("passport-local-mongoose");
const dotenv = require('dotenv');
const async = require("async");
const http = require('http');
dotenv.config();


async function flask_test() {
  var options = {
    host: 'movie_app_flask_backend_1',
    path: '/',
    port: 5000,
    method: 'GET'
  };
  
  var body = ""
  return new Promise((resolve, reject) => {
    const req = http.request(options, (res) => {
      console.log("Request made to FLASK");
      console.log('statusCode:', res.statusCode);
      console.log('headers:', res.headers);
    
      res.on('data', (chunk) => {
        body += chunk;
      });
      res.on('end', () => {
        response_body = JSON.parse(body);
        resolve({"status": res.statusCode, "body": response_body});
      })
    });
    
    req.on('error', (e) => {
      console.error("Error querying Flask Server: " + e);
      reject(e)
    });
    
    req.end();
  });
}

module.exports = {
  flask_test: flask_test
};