const logger = require('../logger');
const config = require('../config');

const log = {
  warn: (msg) => logger.warn(msg),
  error: (msg) => logger.error(msg),
  deprecate: (msg) => logger.notice(msg),
  debug: (msg) => logger.debug(JSON.stringify(msg)),
};

const dbConfig = config.get('database');

module.exports = {
  development: {
    client: dbConfig.client,
    connection: {
      database: dbConfig.name,
      user: dbConfig.username,
      password: dbConfig.password,
    },
    migrations: {
      tableName: 'knex_migrations',
      directory: './migrations',
    },
    seeds: {
      directory: './seeds/dev',
    },
    debug: true,
    log,
  },
  test: {
    client: 'sqlite3',
    useNullAsDefault: true,
    connection: {
      filename: './db/test.sqlite',
    },
    migrations: {
      directory: './db/migrations',
    },
    seeds: {
      directory: './db/seeds/test',
    },
    debug: true,
  },
  production: {
    client: dbConfig.client,
    connection: {
      host: dbConfig.host,
      port: dbConfig.port,
      database: dbConfig.name,
      user: dbConfig.username,
      password: dbConfig.password,
    },
    pool: {
      min: 2,
      max: 10,
    },
    migrations: {
      tableName: 'knex_migrations',
    },
    log,
  },
};
