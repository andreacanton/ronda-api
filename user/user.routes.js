const express = require('express');
const logger = require('../logger');

const User = require('./user.model');

const routes = express.Router();

routes.get('/', async (req, res) => {
  const users = await User.fetchAll();
  res.json(users);
});

routes.post('/', async (req, res) => {
  try {
    const user = await new User(req.body).save();
    res.json(user);
  } catch (e) {
    res.status(500).json(e);
  }
});

routes.get('/:userId', async (req, res) => {
  try {
    const user = await new User({ userId: req.params.userId }).fetch();
    res.json(user);
  } catch (e) {
    logger.error(e);
    if (e.message === 'EmptyResponse') {
      res.status(404).json({ message: 'User not found' });
    } else {
      res.status(500).json(e);
    }
  }
});

routes.patch('/:userId', async (req, res) => {
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
    logger.error(e);
    if (e.message === 'EmptyResponse') {
      res.status(404).json({ message: 'User not found' });
    } else {
      res.status(500).json(e);
    }
  }
});

routes.delete('/:userId', async (req, res) => {
  try {
    await new User({ userId: req.params.userId }).destroy();
    res.json({
      message: `User ${req.params.userId} destroyed`,
    });
  } catch (e) {
    logger.error(e);
    if (e.message === 'EmptyResponse') {
      res.status(404).json({ message: 'User not found' });
    } else {
      res.status(500).json(e);
    }
  }
});

module.exports = routes;
