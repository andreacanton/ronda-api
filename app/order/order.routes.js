const express = require('express');
const { authorize } = require('../authorization/auth.middleware');
const orm = require('../../db');

const Order = require('./order.model');
const OrderItem = require('./order-item.model');
const OrderNote = require('./order-note.model');

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

routes.post('/', authorize(), async (req, res, next) => {
  try {
    const params = req.body;
    const order = await orm.transaction((t) =>
      new Order({
        recipientId: params.recipientId,
        destination: params.destination,
        status: 'created',
      })
        .save(null, { transacting: t })
        .tap((model) =>
          Promise.map(params.items, (item) =>
            new OrderItem(item).save(
              { orderId: model.orderId },
              { transacting: t },
            ),
          ),
        )
        .tap((model) =>
          new OrderNote(params.note).save(
            { orderId: model.orderId, phase: 'creation' },
            { transacting: t },
          ),
        ),
    );
    res.json(order);
  } catch (e) {
    if (/invalid value/.test(e.message)) {
      res.status(400).json({
        error: e,
      });
    } else {
      next(e);
    }
  }
});

module.exports = routes;
