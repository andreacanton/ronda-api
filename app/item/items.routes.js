const express = require('express');
const { authorize } = require('../authorization/auth.middleware');
const orm = require('../../db');

const routes = express.Router();

routes.get('/', authorize(), async (res, req) => {
  const items = await orm.knex.from('items');
  req.json(
    items.map((item) => ({
      itemId: item.item_id,
      name: item.name,
      sizeCategory: item.size_category,
      createdAt: item.created_at,
      updatedAt: item.updated_at,
    })),
  );
});

module.exports = routes;
