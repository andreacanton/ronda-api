const logger = require('../logger');
const { verifyToken } = require('./token');

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
      let token;
      const parts = req.headers.authorization.split(' ');
      if (parts.length === 2) {
        const scheme = parts[0];
        const credentials = parts[1];
        if (/^Bearer$/i.test(scheme)) {
          token = credentials;
        }
      }
      if (!token) {
        throw Error('Token not present in header');
      }
      req.auth = verifyToken(token);
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
