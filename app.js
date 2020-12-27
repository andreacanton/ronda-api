const bodyParser = require('body-parser');
const express = require('express');
const cors = require('cors');
const helmet = require('helmet');
const logger = require('./logger');
const userRoutes = require('./user/user.routes');
const authRoutes = require('./authorization/auth.routes');

const app = express();

app.use(cors());

app.use(
  helmet({
    dnsPrefetchControl: false,
    frameguard: false,
    ieNoOpen: false,
  }),
);

app.use(bodyParser.urlencoded({ extended: false }));
app.use(bodyParser.json());

app.use('/auth', authRoutes);

app.use('/users', userRoutes);

app.get('/', (req, res) => {
  res.json({
    message: 'Welcome to Ronda API',
  });
});

app.use((err, req, res, next) => {
  if (err instanceof Error) {
    logger.error(err);
    res.status(500).json({
      error: err,
    });
  } else {
    next(err);
  }
});

module.exports = app;
