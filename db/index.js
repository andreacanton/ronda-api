// eslint-disable-next-line import/order
const config = require('./knexfile');

const knex = require('knex')(config);
const bookshelf = require('bookshelf')(knex);
const securePassword = require('bookshelf-secure-password');

bookshelf.plugin(securePassword);

module.exports = bookshelf;
