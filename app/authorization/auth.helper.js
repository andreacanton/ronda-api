const jwt = require('jsonwebtoken');
const config = require('../../config');
const { PRIVATE_KEY, PUBLIC_KEY } = require('../../keys');

module.exports.createJwt = (subject, payload, expiration = null) => {
  const token = jwt.sign(payload, PRIVATE_KEY, {
    algorithm: 'RS256',
    subject: subject.toString(),
    expiresIn: expiration || config.get('tokenExpiration'),
  });
  return token;
};

module.exports.verifyJwt = (token) =>
  jwt.verify(token, PUBLIC_KEY, {
    algorithm: 'RS256',
  });

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
