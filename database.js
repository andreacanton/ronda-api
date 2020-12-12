const { Sequelize } = require('sequelize');
const path = require('path');
const logger = require('./logger');
const config = require('./config');

const dbConfig = config.get('database');

let database;

if (['development', 'testing'].include(config.get('env'))) {
  database = new Sequelize({
    dialect: 'sqlite',
    storage: path.join(process.cwd(), 'db', 'database.sqlite'),
    logging: (msg) => logger.debug(msg),
  });
} else {
  database = new Sequelize({
    host: dbConfig.host,
    port: dbConfig.port,
    username: dbConfig.username,
    password: dbConfig.username,
    database: dbConfig.database,
    dialect: dbConfig.dialect,
    logging: (msg) => logger.debug(msg),
  });
}

module.exports = database;
