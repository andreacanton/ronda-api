const express = require('express');
const { authorize } = require('../authorization/auth.middleware');
const Order = require('./order.model');

const routes = express.Router();

routes.get('/', authorize(), async (req, res) => {
  const orders = await Order.fetchWithFilters({
    search: req.query.q,
    page: req.query.p || 1,
    pageSize: req.query.psize || 20,
    status: req.query.status,
    recipientId: req.query.recipientId,
    sort: req.query.sort,
    direction: req.query.dir,
  });
  res.json(orders);
});

module.exports = routes;
