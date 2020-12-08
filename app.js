const bodyParser = require('body-parser');
const express = require('express');
const cors = require('cors');
const helmet = require('helmet');

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

// TODO: Routes

module.exports = app;
