const supertest = require('supertest');
const app = require('../app');
const Token = require('../app/authorization/token.model');
const User = require('../app/user/user.model');
const orm = require('../db/index');

const request = supertest(app);

beforeAll(async () => {
  await orm.knex.migrate.latest();
  return orm.knex.seed.run();
});

describe('Login Process', () => {
  it('responds 200 with json', (done) => {
    request
      .post('/auth/login')
      .send({
        identity: 'admin@test.com',
        password: 'password01',
      })
      .set('Accept', 'application/json')
      .expect('Content-Type', /json/)
      .expect(200)
      .then((response) => {
        expect(response.body.access_token).toBeDefined();
        done();
      })
      .catch((err) => done(err));
  });
  it('responds 401 with wrong password', (done) => {
    request
      .post('/auth/login')
      .send({
        identity: 'admin@test.com',
        password: 'password02',
      })
      .set('Accept', 'application/json')
      .expect('Content-Type', /json/)
      .expect(401)
      .then((response) => {
        expect(response.body.message).toBeDefined();
        done();
      })
      .catch((err) => done(err));
  });
  it('responds 401 with wrong identity', (done) => {
    request
      .post('/auth/login')
      .send({
        identity: 'asurnsame@test.com',
        password: 'password01',
      })
      .set('Accept', 'application/json')
      .expect('Content-Type', /json/)
      .expect(401)
      .then((response) => {
        expect(response.body.message).toBeDefined();
        done();
      })
      .catch((err) => done(err));
  });
});

describe('Forgot Password process', () => {
  it('should reset password correctly', async (done) => {
    try {
      const user = await new User({ email: 'admin@test.com' }).fetch();
      const forgotResponse = await request
        .post(
          `/auth/forgot-password?resetUrl=${encodeURI(
            'http://localhost:3001/reset-password',
          )}`,
        )
        .send({
          identity: user.get('email'),
        })
        .set('Accept', 'application/json')
        .expect('Content-Type', /json/)
        .expect(200);
      expect(forgotResponse.body.message).toBeDefined();
      const token = await new Token({
        userId: user.get('userId'),
        type: 'reset-password',
      }).fetch();
      await request
        .post('/auth/reset-password')
        .set('Authorization', `Bearer ${token.get('tokenId')}`)
        .set('Accept', 'application/json')
        .send({
          password: 'password03',
        })
        .expect('Content-Type', /json/)
        .expect(200);
      await request
        .post('/auth/login')
        .send({
          identity: 'admin@test.com',
          password: 'password03',
        })
        .set('Accept', 'application/json')
        .expect('Content-Type', /json/)
        .expect(200);
      done();
    } catch (err) {
      done(err);
    }
  });
});
