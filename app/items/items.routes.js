const express = require('express');
const { authorize } = require('../authorization/auth.middleware');
const orm = require('../../db');

const routes = express.Router();

routes.get('/', authorize(), async (res, req) => {
  const items = await orm.knex.from('items');
  req.json(items);
});

module.exports = routes;
