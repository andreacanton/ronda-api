const convict = require('convict');
const fs = require('fs');

convict.addFormat(require('convict-format-with-validator').ipaddress);

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
  port: {
    doc: 'The port to bind.',
    format: 'port',
    default: 3001,
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
    dialect: {
      doc: 'Database dialect',
      format: '*',
      default: 'sqlite',
      env: 'DATABASE_DIALECT',
    },
    port: {
      doc: 'The port the db server',
      format: 'port',
      default: 3306,
      env: 'DATABASE_PORT',
    },
    database: {
      doc: 'Database name',
      format: String,
      default: 'ronda',
      env: 'DATABASE_NAME',
    },
    username: {
      doc: 'Database user',
      format: String,
      default: 'ronda',
      env: 'DATABASE_USER',
    },
    password: {
      doc: 'Database password',
      format: String,
      default: 'ronda',
      env: 'DATABASE_PASSWORD',
    },
  },
});

const configFilePath = `./config/${config.get('env')}.json`;
if (fs.statSync(configFilePath).isFile) {
  config.loadFile(configFilePath);
}

config.validate({ allowed: 'strict' });

module.exports = config;
