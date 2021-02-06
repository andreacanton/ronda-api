const express = require('express');
const { authorize } = require('../authorization/auth.middleware');
const { createToken } = require('../authorization/token');
const config = require('../config');
const mailer = require('../mailer');
const logger = require('../logger');
const User = require('./user.model');

const routes = express.Router();

routes.get('/', authorize('admin'), async (req, res) => {
  const users = await User.fetchAll();
  res.json(users);
});

routes.get('/is-taken/:fieldName/:fieldValue', async (req, res) => {
  const isTaken = await User.isFieldTaken(
    req.params.fieldName,
    req.params.fieldValue,
    req.query.userId,
  );
  res.json({
    isTaken,
  });
});

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

routes.get('/:userId', authorize('admin'), async (req, res, next) => {
  try {
    const user = await new User({ userId: req.params.userId }).fetch();
    res.json(user);
  } catch (e) {
    if (e.message === 'EmptyResponse') {
      res.status(404).json({ message: 'User not found' });
    } else {
      next(e);
    }
  }
});

routes.patch('/:userId', authorize('admin'), async (req, res, next) => {
  try {
    const user = await new User({ userId: req.params.userId }).fetch();
    const fields = req.body;
    if (fields.name) {
      user.set('firstname', fields.firstname);
    }
    if (fields.surname) {
      user.set('lastname', fields.lastname);
    }
    if (fields.role) {
      user.set('role', fields.role);
    }
    if (fields.email) {
      user.set('email', fields.email);
    }
    if (fields.password) {
      user.set('password', fields.password);
    }
    if (fields.memberNumber) {
      user.set('memberNumber', fields.memberNumber);
    }
    const saved = await user.save();
    res.json(saved.attributes);
  } catch (e) {
    if (e.message === 'EmptyResponse') {
      res.status(404).json({ message: 'User not found' });
    } else {
      next(e);
    }
  }
});

routes.delete('/:userId', authorize('admin'), async (req, res, next) => {
  try {
    await new User({ userId: req.params.userId }).destroy();
    res.json({
      message: `User ${req.params.userId} destroyed`,
    });
  } catch (e) {
    if (e.message === 'EmptyResponse') {
      res.status(404).json({ message: 'User not found' });
    } else {
      next(e);
    }
  }
});

module.exports = routes;
