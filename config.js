const convict = require('convict');
const fs = require('fs');
const convictFormatWithValidator = require('convict-format-with-validator');

convict.addFormats(convictFormatWithValidator);

const config = convict({
  env: {
    doc: 'The application environment.',
    format: ['production', 'development', 'test'],
    default: 'development',
    env: 'NODE_ENV',
  },
  ip: {
    doc: 'The IP address to bind.',
    format: 'ipaddress',
    default: '127.0.0.1',
    env: 'IP_ADDRESS',
  },
  tokenExpiration: {
    doc: 'The token default expiration time',
    format: String,
    default: '1h',
    env: 'TOKEN_EXPIRATION',
  },
  port: {
    doc: 'The port to bind.',
    format: 'port',
    default: 3000,
    env: 'PORT',
    arg: 'port',
  },
  database: {
    host: {
      doc: 'Database host name/IP',
      format: '*',
      default: 'localhost',
      env: 'DATABASE_HOST',
    },
    client: {
      doc: 'Database client',
      format: '*',
      default: 'mysql2',
      env: 'DATABASE_CLIENT',
    },
    port: {
      doc: 'The port the db server',
      format: 'port',
      default: 3306,
      env: 'DATABASE_PORT',
    },
    name: {
      doc: 'Database name',
      format: String,
      default: 'ronda',
      env: 'DATABASE_NAME',
    },
    username: {
      doc: 'Database user',
      format: String,
      default: 'dev',
      env: 'DATABASE_USER',
    },
    password: {
      doc: 'Database password',
      format: String,
      default: 'dev',
      env: 'DATABASE_PASSWORD',
    },
  },
  email: {
    defaultFrom: {
      doc: 'Default Email from address',
      format: 'email',
      default: 'hello@andreacanton.dev',
      env: 'EMAIL_FROM',
    },
    host: {
      doc: 'SMTP host',
      format: '*',
      default: 'localhost',
      env: 'EMAIL_HOST',
    },
    port: {
      doc: 'SMTP port',
      format: 'port',
      default: 2525,
      env: 'EMAIL_PORT',
    },
    user: {
      doc: 'SMTP user',
      format: String,
      default: 'root',
      env: 'EMAIL_USER',
    },
    pass: {
      doc: 'SMTP pass',
      format: String,
      default: 'root',
      env: 'EMAIL_PASS',
    },
  },
});

const configFilePath = `./config/${config.get('env')}.json`;
if (fs.existsSync(configFilePath)) {
  config.loadFile(configFilePath);
}

config.validate({ allowed: 'strict' });

module.exports = config;
