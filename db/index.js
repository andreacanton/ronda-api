const { Sequelize } = require('sequelize');
const logger = require('../logger');
const config = require('../config');

function initDatabase() {
  const dbConfig = config.get('database');
  if (['development', 'test'].includes(config.get('env'))) {
    return new Sequelize({
      dialect: 'sqlite',
      storage: './database.sqlite',
      logging: (msg) => logger.debug(msg),
    });
  }
  return new Sequelize({
    host: dbConfig.host,
    port: dbConfig.port,
    username: dbConfig.username,
    password: dbConfig.username,
    database: dbConfig.database,
    dialect: dbConfig.dialect,
    logging: (msg) => logger.debug(msg),
  });
}

module.exports = initDatabase();
