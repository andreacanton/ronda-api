const logger = require('../../logger');
const { verifyJwt, getAuthFromHeaders } = require('./auth.helper');
const User = require('../user/user.model');

module.exports.authorize = (role = null) => async (req, res, next) => {
  if (
    req.method === 'OPTIONS' &&
    // eslint-disable-next-line no-prototype-builtins
    req.headers.hasOwnProperty('access-control-request-headers')
  ) {
    return next();
  }

  const token = getAuthFromHeaders(req.headers);
  try {
    if (!token) {
      throw Error('Token not present in header');
    }
    req.auth = {};
    req.auth.payload = verifyJwt(token);

    if (req.auth.payload.sub) {
      req.auth.user = await new User({
        userId: req.auth.payload.sub,
        status: 'enabled',
      }).fetch();
    }

    if (role && req.auth.payload.role !== role) {
      throw Error(`Required role ${role}`);
    }
    return next();
  } catch (error) {
    logger.warn('Unauthorized access', { error, token });
    res.status(401).json({
      message: `Unauthorized access. ${error}`,
    });
    return null;
  }
};
