const logger = require('../logger');
const { verifyToken } = require('./token');
const { getAuthFromHeaders } = require('./auth.helper');
const User = require('../user/user.model');

module.exports.authorize = function (role = null) {
  return (req, res, next) => {
    if (
      req.method === 'OPTIONS' &&
      // eslint-disable-next-line no-prototype-builtins
      req.headers.hasOwnProperty('access-control-request-headers')
    ) {
      return next();
    }

    try {
      const token = getAuthFromHeaders(req.headers);
      if (!token) {
        throw Error('Token not present in header');
      }
      req.auth = {};
      req.auth.payload = verifyToken(token);

      if (req.auth.payload.sub) {
        req.auth.user = new User({ userId: req.auth.payload.sub }).fetch();
      }

      if (req.auth.payload.type !== 'access-token') {
        throw Error(
          `Unauthorized access for token ${token} requested type 'access-token'`,
        );
      }

      if (role && req.auth.role !== role) {
        throw Error(
          `Unauthorized access for token ${token} requested role ${role}`,
        );
      }
      return next();
    } catch (error) {
      logger.warn('Unauthorized access', error);
      res.status(401).json({
        message:
          'Unauthorized access. Header format is Authorization: Bearer [token]',
      });
      return next(error);
    }
  };
};
