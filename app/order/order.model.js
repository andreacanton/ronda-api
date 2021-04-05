const { format } = require('date-fns');
const _ = require('lodash');
const CheckIt = require('checkit');
const orm = require('../../db');

const AVAILABLE_STATUSES = ['created', 'cancelled', 'ready', 'delivered'];

const Order = orm.model(
  'Order',
  {
    tableName: 'orders',
    idAttribute: 'order_id',
    hasTimestamps: true,
    defaults: {
      status: 'created',
    },
    initialize() {
      this.on('creating', async () => {
        const currentYear = format(new Date(), 'YYYY');
        const lastOrder = await orm.knex
          .from('orders')
          .where('created_at', '>', `${currentYear}-01-01`)
          .orderBy('created_at', 'desc')
          .first('order_number');

        const counter = lastOrder
          ? parseInt(lastOrder.order_number.split('-')[2], 10)
          : 0;
        const orderNumber = `#ORD-${currentYear}-${(counter + 1)
          .toString()
          .padStart(4, '0')}`;
        this.set('orderNumber', orderNumber);
      });
      this.on('saving', this.validateSave);
    },
    validateSave() {
      return CheckIt({
        recipientId: [
          'required',
          'integer',
          async (value) => {
            const response = await orm.knex
              .from('recipients')
              .where('recipient_id', '=', value);
            return response.length > 0;
          },
        ],
        destination: ['required'],
        status: ['required', (value) => AVAILABLE_STATUSES.includes(value)],
      }).run(this.attributes);
    },
    parse(response) {
      return _.mapKeys(response, (value, key) => _.camelCase(key));
    },
    format(attributes) {
      return _.mapKeys(attributes, (value, key) => _.snakeCase(key));
    },
  },
  {},
);

module.exports = Order;