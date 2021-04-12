const _ = require('lodash');
const CheckIt = require('checkit');
const orm = require('../../db');

const AVAILABLE_PHASE = ['create', 'edit', 'prepare', 'cancel', 'deliver'];

const OrderNote = orm.model(
  'OrderNote',
  {
    tableName: 'order_notes',
    idAttribute: 'order_note_id',
    initialize() {
      this.on('saving', this.validateSave);
      // eslint-disable-next-line no-unused-vars
      this.on('fetched', (model, columns, options) =>
        model.related('user').fetch({ columns: ['firstname', 'lastname'] }),
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
        userId: [
          'required',
          async (value) => {
            const response = await orm.knex
              .from('users')
              .where('user_id', '=', value);
            return response.length > 0;
          },
        ],
        phase: ['required', (value) => AVAILABLE_PHASE.includes(value)],
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
    user() {
      return this.belongsTo('User', 'user_id', 'user_id');
    },
  },
  {},
);

module.exports = OrderNote;
