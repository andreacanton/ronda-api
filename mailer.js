const nodemailer = require('nodemailer');
const logger = require('./logger');
const config = require('./config');

const emailConfig = config.get('email');

const mailer = nodemailer.createTransport({
  host: emailConfig.host,
  port: emailConfig.port,
  auth: {
    user: emailConfig.user,
    pass: emailConfig.pass,
  },
});

mailer.verify((error, success) => {
  if (error) {
    logger.error(`SMTP Server ${error}`, emailConfig);
  } else if (success) {
    logger.info('SMTP Server is ready to take our messages');
  }
});

module.exports = mailer;
