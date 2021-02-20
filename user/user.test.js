const orm = require('../db/index');
const logger = require('../logger');
const User = require('./user.model');

beforeAll(async () => {
  await orm.knex.migrate.latest();
});
beforeEach(async () => {
  await orm.knex.seed.run();
});
afterAll(() => {});
describe('User model', () => {
  test('User model should be defined', () => {
    expect(User).toBeDefined();
  });
  test('User fetchAll should work', async () => {
    const results = await User.fetchAll();
    expect(results.length).toBe(3);
  });
  test('User fetch by id', async () => {
    const user = await new User({ userId: 2 }).fetch();
    expect(user.get('userId')).toEqual(2);
    expect(user.get('firstname')).toBe('B');
    expect(user.get('role')).toBe('member');
  });
  test('User fetch id 5 should fail', () =>
    expect(new User({ userId: 5 }).fetch()).rejects.toThrow('EmptyResponse'));

  test('User should create', async () => {
    const user = new User({
      memberNumber: 200,
      email: 'andrea.canton@gmail.com',
      role: 'member',
      password: 'Password01',
    });
    expect.assertions(4);
    try {
      const saved = await user.save();
      expect(saved.attributes.userId).toBeDefined();
      expect(saved.attributes.createdAt).toBeDefined();
      expect(saved.attributes.role).toBe('member');
      expect(saved.attributes.password).toBeUndefined();
    } catch (e) {
      logger.error(e);
    }
  });
  test('User should update', async () => {
    const user = new User({ memberNumber: 1 }).fetch();
    try {
      user.role = 'admin';
      const updated = await user.save();
      expect(updated.attributes.createdAt).toBeDefined();
      expect(updated.attributes.lastname).toBe('ASurname');
      expect(updated.attributes.role).toBe('admin');
      expect(updated.attributes.password).toBeUndefined();
    } catch (e) {
      logger.error(e);
    }
  });
});
