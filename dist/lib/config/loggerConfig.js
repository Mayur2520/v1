var winston = require('winston');

const currentDate = new Date(),
  dd = currentDate.getDate() < 10 ? '0' + String(currentDate.getDate()) : currentDate.getDate(),
  mm = (currentDate.getMonth() +1) < 10 ? '0' + String(currentDate.getMonth() + 1) : parseInt(currentDate.getMonth()) + 1,
  yyyy = currentDate.getFullYear(),
  hh = currentDate.getHours() < 10 ? '0' + String(currentDate.getHours()) : currentDate.getHours();

var logfilename = './log/System_' + dd + '_' + mm + '_' + yyyy + '_' + hh + '.log';
var errorlogfile = './log/Error_' + dd + '_' + mm + '_' + yyyy + '_' + hh + '.log';
var exceptionlogfile = './log/Exception_' + dd + '_' + mm + '_' + yyyy + '_' + hh + '.log';

const level = process.env.debuglevel || 'info'

const logger = winston.createLogger({
  level: level,
  format: winston.format.json(),
  transports: [

    // - Write to all logs with level `info` and below to Systme 
    // - Write all logs error (and below) to Error.


    new winston.transports.File({
      filename: logfilename,
      level: 'info'
    }),
    new winston.transports.File({
      filename: errorlogfile,
      level: 'error'
    })
  ],

  // - Write all logs error (and below) to Exception like uncouthException

  exceptionHandlers: [
    new winston.transports.File({
      filename: exceptionlogfile
    })
  ],
  exitOnError: false
});

// If we're not in production then log to the `console` with the format:
// `${info.level}: ${info.message} JSON.stringify({ ...rest }) `

if (process.env.NODE_ENV !== 'production') {
  logger.add(new winston.transports.Console({
    format: winston.format.simple()
  }));
}

// create a stream object with a 'write' function that will be used by `morgan`


logger.stream = {
  write: function (message, encoding) {
    // use the 'info' log level so the output will be picked up by both transpssorts (file and console)
    logger.info(message+'- - Time: '+new Date());
  },
};

module.exports = logger;
