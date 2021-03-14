const express = require('express');
const { authorize } = require('../authorization/auth.middleware');
const Recipient = require('./recipient.model');

const fetchRecipient = () => async (req, res, next) => {
  try {
    req.recipient = await new Recipient({
      recipientId: req.params.recipientId,
    }).fetch();
    next();
  } catch (e) {
    if (e.message === 'EmptyResponse') {
      res.status(404).json({ message: 'Recipient not found' });
    } else {
      next(e);
    }
  }
};

const routes = express.Router();

routes.get('/', authorize(), async (req, res) => {
  const recipients = await Recipient.fetchWithFilters({
    search: req.query.q,
    page: req.query.p || 1,
    pageSize: req.query.psize || 20,
    status: req.query.status,
    sort: req.query.sort,
    direction: req.query.dir,
  });
  res.json(recipients);
});

routes.get(
  '/is-card-number-taken/:fieldValue',
  authorize(),
  async (req, res) => {
    const isTaken = await Recipient.isFieldTaken(
      'cardNumber',
      req.params.fieldValue,
      req.query.recipientId,
    );
    res.json({
      isTaken,
    });
  },
);

routes.post('/', authorize(), async (req, res, next) => {
  try {
    const recipient = await new Recipient(req.body).save();

    res.json(recipient);
  } catch (e) {
    next(e);
  }
});

routes.get('/:recipientId', authorize(), fetchRecipient(), async (req, res) => {
  res.json(req.recipient);
});

routes.patch(
  '/:recipientId',
  authorize(),
  fetchRecipient(),
  async (req, res, next) => {
    try {
      const { recipient } = req;
      const fields = req.body;
      if (fields.cardNumber) {
        recipient.set('cardNumber', fields.cardNumber);
      }
      if (fields.firstname) {
        recipient.set('firstname', fields.firstname);
      }
      if (fields.lastname) {
        recipient.set('lastname', fields.lastname);
      }
      if (fields.email) {
        recipient.set('email', fields.email);
      }
      if (fields.phoneNumber) {
        recipient.set('phoneNumber', fields.phoneNumber);
      }
      if (fields.gender) {
        recipient.set('gender', fields.gender);
      }
      if (fields.topSize) {
        recipient.set('topSize', fields.topSize);
      }
      if (fields.bottomSize) {
        recipient.set('bottomSize', fields.bottomSize);
      }
      if (fields.shoeSize) {
        recipient.set('shoeSize', fields.shoeSize);
      }
      if (fields.status) {
        recipient.set('status', fields.status);
      }
      const saved = await recipient.save();
      res.json(saved.attributes);
    } catch (e) {
      next(e);
    }
  },
);

routes.delete(
  '/:recipientId',
  authorize(),
  fetchRecipient(),
  async (req, res, next) => {
    try {
      req.recipient.set('status', 'disabled');
      await req.recipient.save();
      res.json({
        message: `recipient ${req.params.recipientId} deactivated`,
      });
    } catch (e) {
      next(e);
    }
  },
);

// TODO: ORDERS!

module.exports = routes;
