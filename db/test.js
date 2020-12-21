const orm = require('./index');

test('Orm should be defined', () => {
  expect(orm).toBeDefined();
});

test('Knex should be defined', () => {
  expect(orm.knex).toBeDefined();
});
