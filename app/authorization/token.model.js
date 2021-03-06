const _ = require('lodash');
const CheckIt = require('checkit');
const crypto = require('crypto');
const orm = require('../../db');

const Token = orm.model(
  'Token',
  {
    tableName: 'tokens',
    idAttribute: 'token_id',
    hasTimestamps: true,
    default: {
      type: 'refresh',
    },
    initialize() {
      this.on(
        'creating',
        () => {
          this.set('token_id', crypto.randomBytes(16).toString('hex'));
        },
      );
      this.on('saving', this.validateSave);
    },
    validateSave() {
      return CheckIt({
        tokenId: ['required'],
        userId: ['required', async (value) => {
          const response = await orm.knex.from('users').where('user_id', '=', value);
          return response.length > 0;
        }],
        type: ['required'],
        expiration: ['required'],
      });
    },
    parse(response) {
      return _.mapKeys(response, (value, key) => _.camelCase(key));
    },
    format(attributes) {
      return _.mapKeys(attributes, (value, key) => _.snakeCase(key));
    },
    user() {
      return this.belongsTo('User');
    },
  },
);

module.exports = Token;
