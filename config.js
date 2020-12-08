const convict = require('convict');

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
    default: 3000,
    env: 'PORT',
    arg: 'port',
  },
  db: {
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
    name: {
      doc: 'Database name',
      format: String,
      default: 'ronda',
      env: 'DATABASE_NAME',
    },
    user: {
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

const env = config.get('env');
config.loadFile(`./config/${env}.json`); // TODO: Check if file exists

config.validate({ allowed: 'strict' });

module.exports = config;
