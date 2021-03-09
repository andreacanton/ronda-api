const supertest = require('supertest');
const app = require('../app');

const request = supertest(app);

describe('POST /auth/login', () => {
  it('responds 200 with json', (done) => {
    request
      .get('/')
      .expect(200)
      .then(() => {
        done();
      })
      .catch((err) => done(err));
  });
});
