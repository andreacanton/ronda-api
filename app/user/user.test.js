const orm = require('../../db/index');
const logger = require('../../logger');
const User = require('./user.model');

describe('User model', () => {
  beforeAll(async () => {
    await orm.knex.migrate.latest();
    return orm.knex.seed.run();
  });
  test('User model should be defined', () => {
    expect(User).toBeDefined();
  });
  test('User fetchAll should work', async () => {
    expect.assertions(1);
    const results = await User.fetchAll();
    expect(results.length).toBe(3);
  });
  test('User fetch by id', async () => {
    expect.assertions(3);
    try {
      const user = await new User({ userId: '2272e61b-59b5-4da3-9ab6-27c804930ca5' }).fetch();
      expect(user.get('userId')).toEqual('2272e61b-59b5-4da3-9ab6-27c804930ca5');
      expect(user.get('firstname')).toBe('B');
      expect(user.get('role')).toBe('member');
    } catch (e) {
      logger.error(`User should fetch by id Exception ${e}`);
    }
  });
  test('User fetch id 8db9c992-f0f2-43ef-9264-4a20540e3bcf should fail', () =>
    expect(new User({ userId: '8db9c992-f0f2-43ef-9264-4a20540e3bcf' }).fetch()).rejects.toThrow('EmptyResponse'));

  test('User should create', async () => {
    const user = new User({
      memberNumber: 200,
      email: 'creation.testing@test.com',
      role: 'member',
      password: 'Password01',
      status: 'enabled',
    });
    expect(user.isNew()).toBe(true);
    expect.assertions(5);
    try {
      const saved = await user.save();
      expect(saved.get('userId')).toBeDefined();
      expect(saved.get('createdAt')).toBeDefined();
      expect(saved.get('role')).toBe('member');
      expect(saved.get('password')).toBeUndefined();
    } catch (e) {
      logger.error(`User should create Exception ${e}`);
    }
  });
  test('User should update', async () => {
    expect.assertions(4);
    try {
      const user = await new User({ memberNumber: 1072 }).fetch();
      user.set('role', 'admin');
      user.save().then((updated) => {
        expect(updated.attributes.createdAt).toBeDefined();
        expect(updated.attributes.lastname).toBe('ASurname');
        expect(updated.attributes.role).toBe('admin');
        expect(updated.attributes.password).toBeUndefined();
      });
    } catch (e) {
      logger.error(`User should update Exception ${e}`);
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
    const user = new User({ userId: 'abf65ce3-1a02-475a-a434-dcda9131f068' }).fetch();
    try {
      user.role = 'enabled';
      await user.save();
    } catch (e) {
      expect(e).toBeDefined();
    }
  });
  test('User should not save already registered email', async () => {
    expect.assertions(1);
    const user = new User({ userId: 'abf65ce3-1a02-475a-a434-dcda9131f068' }).fetch();
    try {
      user.email = 'bsurname@test.com';
      await user.save();
    } catch (e) {
      expect(e).toBeDefined();
    }
  });

  test('User should not save already registered member number', async () => {
    expect.assertions(1);
    const user = new User({ userId: 'abf65ce3-1a02-475a-a434-dcda9131f068' }).fetch();
    try {
      user.memberNumber = 574;
      await user.save();
    } catch (e) {
      expect(e).toBeDefined();
    }
  });
  test('User should not save without password', async () => {
    expect.assertions(1);
    const user = new User({ userId: 'abf65ce3-1a02-475a-a434-dcda9131f068' }).fetch();
    try {
      user.password = '';
      await user.save();
    } catch (e) {
      expect(e).toBeDefined();
    }
  });
  test('User should not save without email', async () => {
    expect.assertions(1);
    const user = new User({ userId: 'abf65ce3-1a02-475a-a434-dcda9131f068' }).fetch();
    try {
      user.email = '';
      await user.save();
    } catch (e) {
      expect(e).toBeDefined();
    }
  });
  test('User should not save without member number', async () => {
    expect.assertions(1);
    const user = new User({ userId: 'abf65ce3-1a02-475a-a434-dcda9131f068' }).fetch();
    try {
      user.memberNumber = '';
      await user.save();
    } catch (e) {
      expect(e).toBeDefined();
    }
  });
  test('User should not save without role', async () => {
    expect.assertions(1);
    const user = new User({ userId: 'abf65ce3-1a02-475a-a434-dcda9131f068' }).fetch();
    try {
      user.role = '';
      await user.save();
    } catch (e) {
      expect(e).toBeDefined();
    }
  });
  test('User should not save with a string for memberNumber ', async () => {
    expect.assertions(1);
    const user = new User({ userId: 'abf65ce3-1a02-475a-a434-dcda9131f068' }).fetch();
    try {
      user.memberNumber = 'Not A Number';
      await user.save();
    } catch (e) {
      expect(e).toBeDefined();
    }
  });
  test('User should not save with a string for memberNumber ', async () => {
    expect.assertions(1);
    const user = new User({ userId: 'abf65ce3-1a02-475a-a434-dcda9131f068' }).fetch();
    try {
      user.memberNumber = 'Not A Number';
      await user.save();
    } catch (e) {
      expect(e).toBeDefined();
    }
  });
  test('Fetch users with filters should work', async () => {
    const users = User.fetchWithFilters({
      search: 'asurname',
      page: 1,
      pageSize: 20,
      status: 'enabled',
      sort: 'created_at',
      direction: 'ASC',
    });
    expect(users).toBeDefined();
  });
});
