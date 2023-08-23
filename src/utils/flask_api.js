const dotenv = require('dotenv');
const http = require('http');
dotenv.config();

const {
  FLASK_HOST,
  FLASK_PORT,
} = process.env;


async function flaskTest() {
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
          const responseBody = JSON.parse(body);
          resolve({'status': res.statusCode, 'body': responseBody});
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

    req.end();
  });
}

async function getRecomendations(userId) {
  const requestData = {'user_id': userId};
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
          const responseBody = JSON.parse(body);
          resolve({'status': res.statusCode, 'body': responseBody});
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

    req.write(JSON.stringify(requestData));
    req.end();
  });
}

async function getWatchlist(userId, movieList) {
  const requestData = {'user_id': userId, 'movie_list': movieList};
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
          const responseBody = JSON.parse(body);
          resolve({'status': res.statusCode, 'body': responseBody});
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

    req.write(JSON.stringify(requestData));
    req.end();
  });
}

async function updateBlocklist(userId, mediaId, updateState) {
  const requestData = {'user_id': userId, 'media_id': mediaId, 'update_state': updateState};
  const options = {
    host: `${FLASK_HOST}`,
    path: '/update_blocklist',
    port: `${FLASK_PORT}`,
    method: 'POST',
    headers: {
      'content-type': 'application/json',
    },
  };
  console.log('Sending request to update blocklist against backend...');
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
          const responseBody = JSON.parse(body);
          resolve({'status': res.statusCode, 'body': responseBody});
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

    req.write(JSON.stringify(requestData));
    req.end();
  });
}

module.exports = {
  flask_test: flaskTest,
  get_reccomendations: getRecomendations,
  get_watchlist: getWatchlist,
  updateBlocklist,
};
