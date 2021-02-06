const express = require('express');
const { authorize } = require('../authorization/auth.middleware');
const { createToken } = require('../authorization/token');
const config = require('../config');
const mailer = require('../mailer');
const logger = require('../logger');
const User = require('./user.model');

const fetchUser = function () {
  return async (req, res, next) => {
    try {
      req.user = await new User({ userId: req.params.userId }).fetch();
      next();
    } catch (e) {
      if (e.message === 'EmptyResponse') {
        res.status(404).json({ message: 'User not found' });
      } else {
        next(e);
      }
    }
  };
};

const routes = express.Router();

routes.get('/', authorize('admin'), async (req, res) => {
  const users = await User.fetchAll();
  res.json(users);
});

routes.get(
  '/is-taken/:fieldName/:fieldValue',
  authorize('admin'),
  async (req, res) => {
    const isTaken = await User.isFieldTaken(
      req.params.fieldName,
      req.params.fieldValue,
      req.query.userId,
    );
    res.json({
      isTaken,
    });
  },
);

routes.get('/profile', authorize(), async (req, res) => {
  res.json(req.auth.user);
});

routes.post('/', authorize('admin'), async (req, res, next) => {
  try {
    const params = req.body;
    const user = await new User({
      firstname: params.firstname,
      lastname: params.lastname,
      password: params.password,
      email: params.email,
      memberNumber: params.memberNumber,
      role: params.role,
    }).save();

    if (user.get('email') && req.query.resetUrl) {
      const resetToken = createToken(
        user.get('userId'),
        { resetPassword: true },
        '1h',
      );

      const resetPasswordUrl = `${req.query.resetUrl}?token=${resetToken}`;

      await mailer.sendMail({
        from: config.get('email').defaultFrom,
        to: user.get('email'),
        subject: 'Registrazione per Ronda della carità di Verona',
        html: `
          <h1>Ciao ${user.get('firstname')},</h1>
          <p>Il tuo account per la Ronda della carità è stato registrato correttamente.</p>
          <p>Potrai accedere utilizzando come identificativo d'accesso sia la tua email che il tuo numero socio presente sulla tua tessera associativa:</p>
          <ul>
            <li>email: ${user.get('email')}</li>
            <li>numero socio: ${user.get('memberNumber')}</li>
          </ul>
          <p>Per poter accedere dovrai prima <a href="${resetPasswordUrl}">impostare la password</a>.</p>

          <p>Reimposta password: <a href="${resetPasswordUrl}">${resetPasswordUrl}</a></p>

          <p>Grazie ancora per il tuo impegno</p>
          <p>La direzione</p>
        `,
      });
      logger.debug(`Registration email sent to ${user.email}`);
    }

    res.json(user);
  } catch (e) {
    next(e);
  }
});

routes.get('/:userId', authorize('admin'), fetchUser(), (req, res) => {
  res.json(req.user);
});

routes.patch(
  '/:userId',
  authorize('admin'),
  fetchUser(),
  async (req, res, next) => {
    try {
      const { user, body } = req;
      if (body.name) {
        user.set('firstname', body.firstname);
      }
      if (body.surname) {
        user.set('lastname', body.lastname);
      }
      if (body.role) {
        user.set('role', body.role);
      }
      if (body.email) {
        user.set('email', body.email);
      }
      if (body.password) {
        user.set('password', body.password);
      }
      if (body.memberNumber) {
        user.set('memberNumber', body.memberNumber);
      }
      const saved = await user.save();
      res.json(saved.attributes);
    } catch (e) {
      next(e);
    }
  },
);

routes.delete(
  '/:userId',
  authorize('admin'),
  fetchUser(),
  async (req, res, next) => {
    try {
      await req.user.destroy();
      res.json({
        message: `User ${req.params.userId} destroyed`,
      });
    } catch (e) {
      next(e);
    }
  },
);

module.exports = routes;
