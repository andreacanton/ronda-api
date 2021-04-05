const _ = require('lodash');
const orm = require('../../db');

const Item = orm.model(
  'Item',
  {
    tableName: 'items',
    idAttribute: 'item_id',
    hasTimestamps: true,
    defaults: {
      status: 'created',
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

module.exports = Item;
