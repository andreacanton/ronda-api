const jwt = require('jsonwebtoken');
const fs = require('fs');
const config = require('../config');

const PRIVATE_KEY = fs.readFileSync(`${__dirname}/private_key.pem`);
const PUBLIC_KEY = fs.readFileSync(`${__dirname}/public_key.pem`);

function signJwtToken(subject, payload, expiration = null) {
  const token = jwt.sign(payload, PRIVATE_KEY, {
    algorithm: 'RS256',
    subject: subject.toString(),
    expiresIn: expiration || config.get('tokenExpiration'),
  });
  return token;
}

module.exports.createJwt = signJwtToken;

module.exports.verifyJwt = (token) => jwt.verify(token, PUBLIC_KEY, {
  algorithm: 'RS256',
});

module.exports.refreshJwt = (token) => {
  const payload = jwt.verify(token, PUBLIC_KEY, { ignoreExpiration: true });
  const subject = payload.sub;
  delete payload.sub;
  delete payload.iat;
  delete payload.exp;
  delete payload.nbf;
  delete payload.jti;
  return signJwtToken(subject, payload);
};

module.exports.getPublicKey = () => PUBLIC_KEY.toString();

module.exports.getAuthFromHeaders = (headers) => {
  let token;
  const parts = headers.authorization.split(' ');
  if (parts.length === 2) {
    const scheme = parts[0];
    const credentials = parts[1];
    if (/^Bearer$/i.test(scheme)) {
      token = credentials;
    }
  }
  return token;
};
