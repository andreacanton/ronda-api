const jwt = require('jsonwebtoken');
const fs = require('fs');
const config = require('../config');

const PRIVATE_KEY = fs.readFileSync(`${__dirname}/private_key.pem`);
const PUBLIC_KEY = fs.readFileSync(`${__dirname}/public_key.pem`);

function signToken(subject, payload, expiration = null) {
  const token = jwt.sign(payload, PRIVATE_KEY, {
    algorithm: 'RS256',
    subject: subject.toString(),
    expiresIn: expiration || config.get('tokenExpiration'),
  });
  return token;
}

module.exports.createToken = signToken;

module.exports.verifyToken = (token) => jwt.verify(token, PUBLIC_KEY, {
  algorithm: 'RS256',
});

module.exports.refreshToken = (token) => {
  const payload = jwt.verify(token, PUBLIC_KEY, { ignoreExpiration: true });
  const subject = payload.sub;
  delete payload.sub;
  delete payload.iat;
  delete payload.exp;
  delete payload.nbf;
  delete payload.jti;
  return signToken(subject, payload);
};

module.exports.getPublicKey = () => PUBLIC_KEY.toString();
