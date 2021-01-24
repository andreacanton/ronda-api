const express = require('express');
const logger = require('../logger');
const User = require('../user/user.model');
const { createToken, refreshToken, getPublicKey } = require('./token');
const { getAuthFromHeaders } = require('./auth.helper');

const routes = express.Router();

routes.post('/login', async (req, res) => {
  try {
    let user = await new User({ email: req.body.identity }).fetch({
      require: false,
    });
    if (!user) {
      user = await new User({
        memberNumber: req.body.identity,
      }).fetch({ require: false });
    }
    if (!user) {
      throw Error(`User not found for identity ${req.body.identity}`);
    }
    await user.authenticate(req.body.password);
    const tokenResponse = createToken(user.get('userId'), {
      role: user.get('role'),
      email: user.get('email'),
      firstname: user.get('firstname'),
      lastname: user.get('lastname'),
      memberNumber: user.get('memberNumber'),
    });
    res.json({
      access_token: tokenResponse,
    });
  } catch (e) {
    logger.warn('Login authentication failed', e);
    res.status(401).json({ message: 'Authentication failed' });
  }
});

routes.get('/refresh', async (req, res) => {
  const token = getAuthFromHeaders(req.headers);
  res.json(refreshToken(token));
});

routes.get('/public-key', async (req, res) => {
  res.send(getPublicKey());
});

module.exports = routes;
