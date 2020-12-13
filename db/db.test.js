const { Sequelize } = require('sequelize');
const database = require('./index');

test('Database instance should be defined', () => {
  expect(database).toBeDefined();
});

test('Database instance should be a Sequelize instance', () => {
  expect(database instanceof Sequelize).toBeTruthy();
});
