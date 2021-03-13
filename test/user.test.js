const supertest = require('supertest');
const app = require('../app');
const orm = require('../db/index');

const request = supertest(app);

let adminToken;
let memberToken;

beforeAll(async (done) => {
  await orm.knex.migrate.latest();
  await orm.knex.seed.run();
  await request
    .post('/auth/login')
    .send({
      identity: 'admin@test.com',
      password: 'password01',
    })
    .set('Accept', 'application/json')
    .then((response) => {
      expect(response.body.access_token).toBeDefined();
      adminToken = response.body.access_token;
      done();
    })
    .catch((err) => done(err));
  return request
    .post('/auth/login')
    .send({
      identity: 'membera@test.com',
      password: 'password01',
    })
    .set('Accept', 'application/json')
    .then((response) => {
      expect(response.body.access_token).toBeDefined();
      memberToken = response.body.access_token;
      done();
    })
    .catch((err) => done(err));
});

describe('GET /', () => {
  it('should get 200 with admin token', (done) => {
    request
      .get('/users/')
      .set('Accept', 'application/json')
      .set('Authorization', `Bearer ${adminToken}`)
      .expect('Content-Type', /json/)
      .expect(200)
      .then((response) => {
        expect(response.body.length).toBeDefined();
        done();
      })
      .catch((err) => done(err));
  });
  it('should get 401 with member token', (done) => {
    request
      .get('/users/')
      .set('Accept', 'application/json')
      .set('Authorization', `Bearer ${memberToken}`)
      .expect('Content-Type', /json/)
      .expect(401)
      .then((response) => {
        expect(response.body.message).toBeDefined();
        done();
      })
      .catch((err) => done(err));
  });
});

describe('POST /', () => {
  it('Admin Token: should create', (done) => {
    request
      .post('/users/')
      .send({
        memberNumber: 1800,
        role: 'member',
        firstname: 'Admin',
        lastname: 'Creation',
        password: 'password0231',
        email: 'create@test.com',
        status: 'enabled',
      })
      .set('Accept', 'application/json')
      .set('Authorization', `Bearer ${adminToken}`)
      .expect('Content-Type', /json/)
      .expect(200)
      .then((response) => {
        expect(response.body.userId).toBeDefined();
        expect(response.body.passwordDigest).toBeDefined();
        expect(response.body.password).toBeUndefined();
        expect(response.body.lastname).toBe('Creation');
        done();
      })
      .catch((err) => done(err));
  });
  it('should get 401 with member token', (done) => {
    request
      .post('/users/')
      .send({
        memberNumber: 1800,
        role: 'member',
        firstname: 'Failing',
        lastname: 'creation',
        password: 'password0231',
        email: 'createfail@test.com',
        status: 'enabled',
      })
      .set('Accept', 'application/json')
      .set('Authorization', `Bearer ${memberToken}`)
      .expect('Content-Type', /json/)
      .expect(401)
      .then((response) => {
        expect(response.body.message).toBeDefined();
        done();
      })
      .catch((err) => done(err));
  });
  it('should get 400 with wrong data', (done) => {
    request
      .post('/users/')
      .send({
        memberNumber: 1800,
        role: 'failing',
        firstname: 'Failing',
        lastname: 'creation',
        password: 'password0231',
        email: 'create@test.com',
        status: 'invisible',
      })
      .set('Accept', 'application/json')
      .set('Authorization', `Bearer ${adminToken}`)
      .expect('Content-Type', /json/)
      .expect(400)
      .then((response) => {
        expect(response.body.error).toBeDefined();
        done();
      })
      .catch((err) => done(err));
  });
});
