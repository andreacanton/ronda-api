const express = require('express');

const User = require('./user.model');

const routes = express.Router();

const errorHandler = (error, res) => {
  if (error instanceof User.NotFoundError) {
    return res.status(404);
  }
  return res.status(500).body(error);
};

routes.get('/', async (req, res) => {
  const users = await User.fetchAll();
  res.json(users);
});

routes.post('/', async (req, res) => {
  try {
    const user = await new User(req.body).save();
    res.json(user);
  } catch (e) {
    errorHandler(e, res);
  }
});

routes.get('/:userId', async (req, res) => {
  try {
    const user = await new User({ userId: req.params.userId }).fetch();
    res.json(user);
  } catch (e) {
    errorHandler(e, res);
  }
});

routes.patch('/:userId', async (req, res) => {
  try {
    const user = await new User({ userId: req.params.userId }).fetch();
    res.json(user);
    const fields = req.body;
    user.set('name', fields.name);
    user.set('surname', fields.surname);
    user.set('role', fields.role);
    user.set('email', fields.email);
    const saved = await user.save();
    res.body(saved);
  } catch (e) {
    errorHandler(e, res);
  }
});

routes.delete('/:userId', async (req, res) => {
  try {
    await new User({ userId: req.params.userId }).destroy();
    res.json({
      message: `User ${req.params.userId} destroyed`,
    });
  } catch (e) {
    errorHandler(e, res);
  }
});

module.exports = routes;
