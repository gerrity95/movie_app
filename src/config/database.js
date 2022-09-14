const mongoose = require('mongoose');

const {
  MONGO_USERNAME,
  MONGO_PASSWORD,
  MONGO_HOSTNAME,
  MONGO_PORT,
  MONGO_DB,
} = process.env;

const options = {
  useNewUrlParser: true,
  connectTimeoutMS: 10000,
};

const url = `mongodb://${MONGO_USERNAME}:${MONGO_PASSWORD}@${MONGO_HOSTNAME}:
${MONGO_PORT}/${MONGO_DB}?authSource=${MONGO_DB}`;

const connection = mongoose.connect(url, options).then( function() {
  console.log('MongoDB is connected');
}).catch( function(err) {
  console.log(err);
});

module.exports = {
  connection: connection,
};
