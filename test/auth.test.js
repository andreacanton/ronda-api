const supertest = require('supertest');
const app = require('../app');
const orm = require('../db/index');

const request = supertest(app);

beforeAll(async () => {
  await orm.knex.migrate.latest();
  return orm.knex.seed.run();
});

describe('POST /auth/login', () => {
  it('responds 200 with json', (done) => {
    request
      .post('/auth/login')
      .send({
        identity: 'asurname@test.com',
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
        identity: 'asurname@test.com',
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
