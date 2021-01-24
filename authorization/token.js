const jwt = require('jsonwebtoken');
const fs = require('fs');
const config = require('../config');

const PRIVATE_KEY = fs.readFileSync(`${__dirname}/private_key.pem`);
const PUBLIC_KEY = fs.readFileSync(`${__dirname}/public_key.pem`);

function signToken(subject, payload) {
  const token = jwt.sign(payload, PRIVATE_KEY, {
    algorithm: 'RS256',
    subject: subject.toString(),
    expiresIn: config.get('tokenExpiration'),
  });
  return token;
}

module.exports.createToken = signToken;

// eslint-disable-next-line func-names
module.exports.verifyToken = function (token) {
  return jwt.verify(token, PUBLIC_KEY, {
    algorithm: 'RS256',
  });
};

// eslint-disable-next-line func-names
module.exports.refreshToken = function (token) {
  const payload = jwt.verify(token, PUBLIC_KEY, { ignoreExpiration: true });
  const subject = payload.sub;
  delete payload.sub;
  delete payload.iat;
  delete payload.exp;
  delete payload.nbf;
  delete payload.jti;
  return signToken(subject, payload);
};

module.exports.getPublicKey = function () {
  return PUBLIC_KEY.toString();
};
