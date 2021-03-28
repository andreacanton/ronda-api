const bodyParser = require('body-parser');
const express = require('express');
const cors = require('cors');
const helmet = require('helmet');
const swaggerUi = require('swagger-ui-express');
const logger = require('./logger');
const authRoutes = require('./app/authorization/auth.routes');
const userRoutes = require('./app/user/user.routes');
const recipientRoutes = require('./app/recipient/recipient.routes');
const itemsRoutes = require('./app/items/items.routes');
const swaggerDoc = require('./swagger.json');
const config = require('./config');

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

app.use('/recipients', recipientRoutes);

app.use('/items', itemsRoutes);

app.use(
  '/api-docs/',
  swaggerUi.serve,
  swaggerUi.setup(swaggerDoc, {
    host: config.get('host'),
  }),
);

app.get('/', (req, res) => {
  res.json({
    message: 'Welcome to Ronda API. Visit ',
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
