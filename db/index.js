const knex = require('knex');
const bookshelf = require('bookshelf');
const securePassword = require('bookshelf-secure-password'); // TODO: Remove package because have an old bcrypt
const config = require('../config');
const knexConfig = require('./knexfile');

const connection = knex(knexConfig[config.get('env')]);
const orm = bookshelf(connection);

orm.plugin(securePassword);

module.exports = orm;
