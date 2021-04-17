const express = require('express');
const { addMinutes, addWeeks, addSeconds } = require('date-fns');
const logger = require('../../logger');
const User = require('../user/user.model');
const config = require('../../config');
const mailer = require('../../mailer');
const { createJwt, getPublicKey } = require('./auth.helper');
const { getAuthFromHeaders } = require('./auth.helper');
const Token = require('./token.model');

const routes = express.Router();

const getAccessAndRefreshTokenFromUser = async (user) => {
  const accessToken = createJwt(user.get('userId'), {
    role: user.get('role'),
    email: user.get('email'),
    firstname: user.get('firstname'),
    lastname: user.get('lastname'),
    memberNumber: user.get('memberNumber'),
  });

  const refreshToken = new Token({
    userId: user.get('userId'),
    type: 'refresh-token',
    expiration: addSeconds(new Date(), config.get('refreshTokenExpiration')),
  });
  await refreshToken.save();
  return {
    access_token: accessToken,
    refresh_token: refreshToken.get('tokenId'),
  };
};

routes.post('/login', async (req, res) => {
  try {
    let user = await new User({
      email: req.body.identity,
      status: 'enabled',
    }).fetch({
      require: false,
    });
    if (!user) {
      user = await new User({
        memberNumber: req.body.identity,
        status: 'enabled',
      }).fetch({ require: false });
    }
    if (!user) {
      throw Error(`User not found for identity ${req.body.identity}`);
    }

    await user.authenticate(req.body.password);

    const oldRefreshToken = await new Token({
      userId: user.get('userId'),
      type: 'refresh-token',
    }).fetch({ require: false });

    if (oldRefreshToken) {
      oldRefreshToken.set('expiration', addSeconds(new Date(), -1));
      await oldRefreshToken.save();
    }

    res.json(await getAccessAndRefreshTokenFromUser(user));
  } catch (e) {
    logger.warn('Login authentication failed', e);
    res.status(401).json({ message: 'Authentication failed' });
  }
});

routes.get('/refresh', async (req, res) => {
  try {
    const refreshTokenId = getAuthFromHeaders(req.headers);
    const oldRefreshToken = await new Token({
      tokenId: refreshTokenId,
    }).fetch();

    const expirationDate = oldRefreshToken.get('expiration');

    if (expirationDate <= new Date()) {
      throw new Error();
    }

    oldRefreshToken.set('expiration', addSeconds(new Date(), -1));
    await oldRefreshToken.save();

    const user = await new User({
      userId: oldRefreshToken.get('userId'),
      status: 'enabled',
    }).fetch();

    res.json(await getAccessAndRefreshTokenFromUser(user));
  } catch (e) {
    logger.warn('Invalid refresh token', e);
    res.status(401).json({ message: 'Invalid refresh token' });
  }
});

routes.get('/public-key', async (req, res) => {
  res.send(getPublicKey());
});

routes.post('/forgot-password', async (req, res) => {
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
    const token = new Token({
      userId: user.get('userId'),
      type: 'reset-password',
      expiration: addMinutes(new Date(), 15),
    });
    await token.save();

    const resetPasswordUrl = `${req.query.resetUrl}?token=${encodeURIComponent(
      token.get('tokenId'),
    )}`;

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
    logger.debug(`Reset password email sent to ${user.email}`);

    res.json({
      message: 'Reset password email sent!',
    });
  } catch (e) {
    logger.warn('Forgot password failed', e);
    res.status(400).json({ message: e.message });
  }
});

routes.post('/reset-password', async (req, res) => {
  try {
    const tokenId = getAuthFromHeaders(req.headers);
    const token = await new Token({ tokenId }).fetch({ withRelated: ['user'] });

    const type = token.get('type');
    if (type !== 'reset-password') {
      throw Error(`Invalid type token ${type}`);
    }

    const user = token.related('user');
    user.set('password', req.body.password);

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
