const express = require('express');

const User = require('./user.model').default;

const routes = express.Router();

const errorHandler = (error, res) => {
  if (error instanceof User.NotFoundError) {
    return res.status(404);
  }
  return res.status(500).body(error);
};

routes.get('/', (req, res) => {
  User.fetchAll().then((users) => {
    res.json(users);
  });
});

routes.post('/', (req, res) => {
  User.forge(req.body)
    .save()
    .then((user) => res.json(user))
    .catch((error) => errorHandler(error, res));
});

routes.get('/:userId', (req, res) => {
  User({ userId: req.params.userId })
    .fetch()
    .then((user) => res.json(user))
    .catch((error) => res.status(400).body(error));
});

routes.patch('/:userId', (req, res) => {
  User({ userId: req.params.userId })
    .fetch()
    .then(async (user) => {
      const fields = req.body;
      user.set('name', fields.name);
      user.set('surname', fields.surname);
      user.set('role', fields.role);
      user.set('email', fields.email);
      user
        .save()
        .then((savedUser) => res.body(savedUser))
        .catch((error) => errorHandler(error, res));
    })
    .catch((error) => errorHandler(error, res));
});

routes.delete('/:userId', (req, res) => {
  User({ userId: req.params.userId })
    .destroy()
    .then(() => res.json(`User ${req.params.userId} destroyed`))
    .catch((error) => res.status(400).body(error));
});

module.exports = routes;
