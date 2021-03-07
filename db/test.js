const orm = require('./index');

beforeAll(async () => {
});
describe('database', () => {
  test('Orm should be defined', () => {
    expect(orm).toBeDefined();
  });
  test('Knex should be defined', () => {
    expect(orm.knex).toBeDefined();
  });
  test('orm should create model', () => {
    const Migrations = orm.model('Migrations', {
      tableName: 'knex_migrations',
    });
    expect(Migrations).toBeDefined();
  });
});
