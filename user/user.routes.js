const express = require('express');
const { authorize } = require('../authorization/auth.middleware');
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

routes.post('/', authorize('admin'), async (req, res, next) => {
  try {
    const user = await new User(req.body).save();

    // TODO: remove password from email and add link to recover/set password
    if (user.get('email')) {
      await mailer.sendMail({
        from: config.get('email').defaultFrom,
        to: user.get('email'),
        subject: 'Registrazione per Ronda della carità di Verona',
        html: `
          <h1>Ciao, ${user.get('firstname')}</h1>
          <p>Il tuo account è stato registrato correttamente, queste sono le tue credenziali:</p>
          <ul>
            <li>email: ${user.get('email')}</li>
            <li>password: ${req.body.password}</li>
          </ul>
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
      user.set('name', fields.name);
    }
    if (fields.surname) {
      user.set('surname', fields.surname);
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
