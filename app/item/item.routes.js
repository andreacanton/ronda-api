const express = require('express');
const { authorize } = require('../authorization/auth.middleware');
const Item = require('./item.model');

const routes = express.Router();

routes.get('/', authorize(), async (res, req) => {
  const items = await Item.fetchAll();
  req.json(items);
});

module.exports = routes;
