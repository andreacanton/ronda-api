const express = require('express');

const users = express.Router();

users.get('/', (req, res) => {
  res.json({
    message: 'All the users!',
  });
});

users.post('/', (req, res) => {
  res.json({
    message: 'add a users!',
  });
});

users.get('/:userId', (req, res) => {
  res.json({
    message: `show the users with id ${req.params.userId}!`,
  });
});

users.patch('/:userId', (req, res) => {
  res.json({
    message: `edit the users with id ${req.params.userId}!`,
  });
});

users.delete('/:userId', (req, res) => {
  res.json({
    message: `delete the users with id ${req.params.userId}!`,
  });
});

module.exports = users;
