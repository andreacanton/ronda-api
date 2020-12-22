const _ = require('lodash');
const CheckIt = require('checkit');
const orm = require('../db');

const AVAILABLE_ROLES = ['member', 'admin'];

const User = orm.model('User', {
  tableName: 'users',
  idAttribute: 'user_id',
  hasSecurePassword: 'passwordDigest',
  defaults: {
    role: 'member',
  },
  initialize() {
    this.on(
      'creating',
      () =>
        CheckIt({
          email: ['required'],
          role: ['required'],
          memberNumber: ['required'],
          passwordDigest: ['required'],
        }).run(this.attributes),
      // eslint-disable-next-line function-paren-newline
    );

    this.on('updating', () => {
      this.attributes.updated_at = new Date();
    });
    this.on('saving', this.validateSave);
  },
  validateSave() {
    return CheckIt({
      memberNumber: [
        'integer',
        (value) =>
          orm.knex
            .from('users')
            .where('member_number', '=', value)
            .where('user_id', '!=', this.attributes.userId || 0)
            .then((resp) => {
              if (resp.length > 0)
                // eslint-disable-next-line nonblock-statement-body-position
                throw new Error('Member Number already registered');
            }),
      ],
      email: [
        'email',
        (value) =>
          orm.knex
            .from('users')
            .where('email', '=', value)
            .where('user_id', '!=', this.attributes.userId || 0)
            .then((resp) => {
              if (resp.length > 0)
                // eslint-disable-next-line nonblock-statement-body-position
                throw new Error('Email already registered');
            }),
      ],
      role: (value) => AVAILABLE_ROLES.includes(value),
    }).run(this.attributes);
  },
  parse(response) {
    return _.mapKeys(response, (value, key) => _.camelCase(key));
  },
  format(attributes) {
    return _.mapKeys(attributes, (value, key) => _.snakeCase(key));
  },
});

module.exports = User;
