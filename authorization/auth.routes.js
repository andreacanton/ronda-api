const express = require('express');
const logger = require('../logger');
const User = require('../user/user.model');
const config = require('../config');
const mailer = require('../mailer');
const {
  createToken,
  refreshToken,
  getPublicKey,
  verifyToken,
} = require('./token');
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

routes.get('/forgot', async (req, res) => {
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
    if (!req.query.resetUrl) {
      throw Error('resetUrl query param missing');
    }

    const resetToken = createToken(
      user.get('userId'),
      { resetPassword: true },
      '1h',
    );

    const resetPasswordUrl = `${req.query.resetUrl}?token=${resetToken}`;

    await mailer.sendMail({
      from: config.get('email').defaultFrom,
      to: user.get('email'),
      subject: 'Reimposta password account',
      html: `
        <h1>Ciao ${user.get('firstname')},</h1>
        <p>È stato richiesto di <a href="${resetPasswordUrl}">reimpostare la password</a> per il tuo account</p>

        <p>Reimposta password: <a href="${resetPasswordUrl}">${resetPasswordUrl}</a></p>

        <p>Se non sei a stato/a tu a richiederlo ignora questa email.</p>

        <p>La direzione</p>
      `,
    });
    logger.debug(`Registration email sent to ${user.email}`);

    res.json({
      message: 'Reset password email sent!',
    });
  } catch (e) {
    logger.warn('Forgot password failed', e);
    res.status(400).json({ message: e.message });
  }
});

routes.get('/reset-password', async (req, res) => {
  try {
    const token = getAuthFromHeaders(req.headers);
    const payload = verifyToken(token);
    const user = await new User({ userId: payload.sub }).fetch();

    user.set('password', req.password);

    await user.save();
    res.json({
      message: 'Password has been reset',
    });
  } catch (e) {
    logger.warn('Reset password failed', e);
    res.status(400).json({ message: e.message });
  }
});

module.exports = routes;
