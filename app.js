const bodyParser = require('body-parser');
const express = require('express');
const cors = require('cors');
const helmet = require('helmet');
const userRoutes = require('./user/user.routes');

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

app.use('/users', userRoutes);

// TODO: Routes
app.get('/', (req, res) => {
  res.json({
    message: 'Welcome to Ronda API',
  });
});

module.exports = app;
