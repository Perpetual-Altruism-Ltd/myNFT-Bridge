var winston = require('winston');
require('winston-daily-rotate-file');

const { createLogger, format, transports } = require('winston');
const { combine, timestamp, label, printf } = format;

const myFormat = printf(({ level, message, label, timestamp }) => {
  return `${timestamp} [${level}] ${message}`;
});

const logger = winston.createLogger({
  level: 'info',
  format: combine(
    label({ label: 'Main Server' }),
    timestamp(),
    myFormat
  ),
  defaultMeta: { service: 'user-service' },
  transports: [
    new winston.transports.Console( {level: 'info'}),
    new winston.transports.File({ filename: './log/error.log', level: 'error'}),
	new (winston.transports.DailyRotateFile)({
	  filename: './log/bridge-%DATE%.log',
	  datePattern: 'YYYY-MM-DD-HH',
	  zippedArchive: true,
	  maxSize: '20m',
	  maxFiles: '365d'
	}),
  ]
});

logger.info("server.js: Logging started...");

exports.logger = logger;