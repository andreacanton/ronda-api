const express = require('express');
const Bluebird = require('bluebird');
const { authorize } = require('../authorization/auth.middleware');
const orm = require('../../db');

const Order = require('./order.model');
const OrderItem = require('./order-item.model');
const OrderNote = require('./order-note.model');

const fetchOrder = () => async (req, res, next) => {
  try {
    const order = await new Order({ orderId: req.params.orderId }).fetch({
      withRelated: ['orderNotes', 'orderItems'],
    });
    await order
      .related('recipient')
      .fetch({ columns: ['firstname', 'lastname', 'card_number'] });

    req.order = order;
    next();
  } catch (e) {
    if (e.message === 'EmptyResponse') {
      res.status(404).json({ message: 'Order not found' });
    } else {
      next(e);
    }
  }
};

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

routes.get('/:orderId', authorize(), fetchOrder(), async (req, res) => {
  res.json(req.order);
});

routes.post('/', authorize(), async (req, res, next) => {
  try {
    const { body, auth } = req;
    const order = await orm.transaction((t) =>
      new Order({
        recipientId: body.recipientId,
        destination: body.destination,
        status: 'created',
      })
        .save(null, { transacting: t })
        .tap((model) =>
          Bluebird.map(body.items, (item) =>
            new OrderItem(item).save({ orderId: model.id }, { transacting: t }),
          ),
        )
        .tap((model) =>
          new OrderNote().save(
            {
              orderId: model.id,
              phase: 'create',
              body: body.note,
              userId: auth.user.id,
            },
            { transacting: t },
          ),
        ),
    );
    res.json(await order.fetch({ withRelated: ['orderItems', 'orderNotes'] }));
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

routes.patch('/:orderId', authorize(), fetchOrder(), async (req, res, next) => {
  if (req.order.get('status') !== 'created') {
    res.status(400).json({
      error: 'Order is not in created status',
    });
    next();
  }

  try {
    const { body, auth, order } = req;
    await orm.transaction((t) => {
      if (body.recipientId) {
        order.set('recipientId', body.recipientId);
      }
      if (body.destination) {
        order.set('destination', body.destination);
      }
      return order
        .save(null, { transacting: t })
        .tap(async (model) =>
          orm
            .knex('order_items')
            .where({ order_id: order.id })
            .del()
            .then(() =>
              Bluebird.map(body.items, (item) =>
                new OrderItem(item).save(
                  { orderId: model.id },
                  { transacting: t },
                ),
              ),
            ),
        )
        .tap((model) =>
          new OrderNote().save(
            {
              orderId: model.id,
              phase: 'edit',
              body: body.note,
              userId: auth.user.id,
            },
            { transacting: t },
          ),
        );
    });
    res.json(await order.fetch({ withRelated: ['orderItems', 'orderNotes'] }));
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

routes.patch(
  '/:orderId/cancel',
  authorize(),
  fetchOrder(),
  async (req, res, next) => {
    if (!['prepared', 'created'].includes(req.order.get('status'))) {
      res.status(400).json({
        error: 'Order is not in created or prepared status',
      });
      next();
    }

    try {
      const { body, auth } = req;
      const order = await orm.transaction((t) =>
        new Order({
          orderId: req.order.id,
          status: 'canceled',
        })
          .save(null, { transacting: t })
          .tap((model) =>
            new OrderNote().save(
              {
                orderId: model.id,
                phase: 'cancel',
                body: body.note,
                userId: auth.user.id,
              },
              { transacting: t },
            ),
          ),
      );
      res.json(
        await order.fetch({ withRelated: ['orderItems', 'orderNotes'] }),
      );
    } catch (e) {
      if (/invalid value/.test(e.message)) {
        res.status(400).json({
          error: e,
        });
      } else {
        next(e);
      }
    }
  },
);

routes.patch(
  '/:orderId/prepare',
  authorize(),
  fetchOrder(),
  async (req, res, next) => {
    if (req.order.get('status') !== 'created') {
      res.status(400).json({
        error: 'Order is not in created status',
      });
      next();
    }

    try {
      const { body, auth } = req;
      const order = await orm.transaction((t) =>
        new Order({
          orderId: req.order.id,
          status: 'prepared',
        })
          .save(null, { transacting: t })
          .tap((model) =>
            new OrderNote().save(
              {
                orderId: model.id,
                phase: 'prepare',
                body: body.note,
                userId: auth.user.id,
              },
              { transacting: t },
            ),
          ),
      );
      res.json(
        await order.fetch({ withRelated: ['orderItems', 'orderNotes'] }),
      );
    } catch (e) {
      if (/invalid value/.test(e.message)) {
        res.status(400).json({
          error: e,
        });
      } else {
        next(e);
      }
    }
  },
);

routes.patch(
  '/:orderId/deliver',
  authorize(),
  fetchOrder(),
  async (req, res, next) => {
    if (req.order.get('status') !== 'prepared') {
      res.status(400).json({
        error: 'Order is not in prepared status',
      });
      next();
    }

    try {
      const { body, auth } = req;
      const order = await orm.transaction((t) =>
        new Order({
          orderId: req.order.id,
          status: 'delivered',
        })
          .save(null, { transacting: t })
          .tap((model) =>
            new OrderNote().save(
              {
                orderId: model.id,
                phase: 'deliver',
                body: body.note,
                userId: auth.user.id,
              },
              { transacting: t },
            ),
          ),
      );
      res.json(
        await order.fetch({ withRelated: ['orderItems', 'orderNotes'] }),
      );
    } catch (e) {
      if (/invalid value/.test(e.message)) {
        res.status(400).json({
          error: e,
        });
      } else {
        next(e);
      }
    }
  },
);

module.exports = routes;
