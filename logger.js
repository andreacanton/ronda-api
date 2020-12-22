const { createLogger, format, transports } = require('winston');

const stringFormat = format.printf(
  // eslint-disable-next-line object-curly-newline
  ({ level, message, timestamp, ...metadata }) => {
    let msg = `${timestamp} [${level}] : ${message} `;
    if (metadata) {
      msg += JSON.stringify(metadata);
    }
    return msg;
  },
);

const logger = createLogger({
  level: 'info',
  format: format.combine(format.timestamp(), format.json()),
  transports: [
    new transports.File({ filename: 'logs/error.log', level: 'error' }),
    new transports.File({ filename: 'logs/all.log' }),
  ],
});

if (process.env.NODE_ENV !== 'production') {
  logger.add(
    new transports.Console({
      format: format.combine(
        format.colorize(),
        format.splat(),
        format.timestamp(),
        stringFormat,
      ),
    }),
  );
}

module.exports = logger;
