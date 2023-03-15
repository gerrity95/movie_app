const {createLogger, format, transports} = require('winston');
const {combine, timestamp, colorize, errors} = format;

const logger = createLogger({
  format: combine(
      errors({stack: true}), // <-- use errors format
      colorize(),
      timestamp(),
      format.printf(({level, message, timestamp, stack}) => {
        if (stack) {
          // print log trace
          return `${timestamp} ${level}: ${message} - ${stack}`;
        }
        return `${timestamp} ${level}: ${message}`;
      }),
  ),
  transports: [new transports.Console(), new transports.File({filename: 'logs/server.log'})],
});

module.exports = logger;
