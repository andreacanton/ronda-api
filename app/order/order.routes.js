const express = require('express');
const { authorize } = require('../authorization/auth.middleware');
const orm = require('../../db');

const Order = require('./order.model');
const OrderItem = require('./order-item.model');
const OrderNote = require('./order-note.model');

const fetchOrder = () => async (req, res, next) => {
  try {
    req.order = await new Order({ orderId: req.params.orderId }).fetch({
      withRelated: ['orderNote', 'orderItem'],
    });
    next();
  } catch (e) {
    if (e.message === 'EmptyResponse') {
      res.status(404).json({ message: 'User not found' });
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
          Promise.map(body.items, (item) =>
            new OrderItem(item).save({ orderId: model.id }, { transacting: t }),
          ),
        )
        .tap((model) =>
          new OrderNote().save(
            {
              orderId: model.id,
              phase: 'create',
              body: body.note,
              userId: auth.user.userId,
            },
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

routes.patch('/:orderId', authorize(), fetchOrder(), async (req, res, next) => {
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
        recipientId: body.recipientId,
        destination: body.destination,
      })
        .save(null, { transacting: t })
        .tap((model) => {
          req.order.orderItems().forEach(async (item) => {
            await item.destroy({ transacting: t });
          });
          return Promise.map(body.items, (item) =>
            new OrderItem(item).save({ orderId: model.id }, { transacting: t }),
          );
        })
        .tap((model) =>
          new OrderNote().save(
            {
              orderId: model.id,
              phase: 'edit',
              body: body.note,
              userId: auth.user.userId,
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
                userId: auth.user.userId,
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
                userId: auth.user.userId,
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
                userId: auth.user.userId,
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
