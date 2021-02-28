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
      email: 'creation.testing@test.com',
      role: 'member',
      password: 'Password01',
    });
    expect(user.isNew()).toBe(true);
    expect.assertions(4);
    try {
      const saved = await user.save();
      expect(saved.get('userId')).toBeDefined();
      expect(saved.get('createdAt')).toBeDefined();
      expect(saved.get('role')).toBe('member');
      expect(saved.get('password')).toBeUndefined();
    } catch (e) {
      logger.error(e);
    }
  });
  test('User should update', async () => {
    const user = new User({ memberNumber: 1072 }).fetch();
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

  test('User should not update status not available', async () => {
    expect.assertions(1);
    const user = new User({ memberNumber: 1072 }).fetch();
    try {
      user.status = 'admin';
      await user.save();
    } catch (e) {
      expect(e).toBeDefined();
    }
  });
  test('User should not update role not available', async () => {
    expect.assertions(1);
    const user = new User({ userId: 1 }).fetch();
    try {
      user.role = 'enabled';
      await user.save();
    } catch (e) {
      expect(e).toBeDefined();
    }
  });

  test('User should not save already registered email', async () => {
    expect.assertions(1);
    const user = new User({ userId: 1 }).fetch();
    try {
      user.email = 'bsurname@test.com';
      await user.save();
    } catch (e) {
      expect(e).toBeDefined();
    }
  });

  test('User should not save already registered email', async () => {
    expect.assertions(1);
    const user = new User({ userId: 1 }).fetch();
    try {
      user.memberNumber = 574;
      await user.save();
    } catch (e) {
      expect(e).toBeDefined();
    }
  });
});
