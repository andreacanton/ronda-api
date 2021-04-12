const _ = require('lodash');
const CheckIt = require('checkit');
const orm = require('../../db');

const OrderItem = orm.model(
  'OrderItem',
  {
    tableName: 'order_items',
    idAttribute: 'order_item_id',
    initialize() {
      this.on('saving', this.validateSave);
      // eslint-disable-next-line no-unused-vars
      this.on('fetched', (model, columns, options) =>
        model.related('item').fetch(),
      );
    },
    validateSave() {
      return CheckIt({
        orderId: [
          'required',
          'integer',
          async (value) => {
            const response = await orm.knex
              .from('orders')
              .where('order_id', '=', value);
            return response.length > 0;
          },
        ],
        itemId: [
          'required',
          'integer',
          async (value) => {
            const response = await orm.knex
              .from('items')
              .where('item_id', '=', value);
            return response.length > 0;
          },
        ],
        size: ['required'],
        genre: ['required', (value) => ['male', 'female'].includes(value)],
        quantity: ['required', 'integer', 'greaterThan:1'],
      }).run(this.attributes);
    },
    parse(response) {
      return _.mapKeys(response, (value, key) => _.camelCase(key));
    },
    format(attributes) {
      return _.mapKeys(attributes, (value, key) => _.snakeCase(key));
    },
    order() {
      return this.belongsTo('Order', 'order_id', 'order_id');
    },
    item() {
      return this.belongsTo('Item', 'item_id', 'item_id');
    },
  },
  {},
);

module.exports = OrderItem;
