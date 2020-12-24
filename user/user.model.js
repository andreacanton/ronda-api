const _ = require('lodash');
const CheckIt = require('checkit');
const orm = require('../db');

const AVAILABLE_ROLES = ['member', 'admin'];

const User = orm.model(
  'User',
  {
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
            User.isFieldTaken(
              'memberNumber',
              value,
              this.attributes.userId,
            ).then((exists) => {
              if (exists)
                // eslint-disable-next-line nonblock-statement-body-position
                throw new Error('Member Number already registered');
            }),
        ],
        email: [
          'email',
          (value) =>
            User.isFieldTaken('email', value, this.attributes.userId).then(
              (exists) => {
                if (exists)
                  // eslint-disable-next-line nonblock-statement-body-position
                  throw new Error('Email already registered');
              },
            ),
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
  },
  {
    async isFieldTaken(fieldName, fieldValue, userId = null) {
      let query = orm.knex
        .from('users')
        .where(_.snakeCase(fieldName), '=', fieldValue);
      if (userId) {
        query = query.where('user_id', '=', userId);
      }
      const resp = await query;
      return resp.length > 0;
    },
    async fetchFromIdentity(identity) {
      const response = await orm.knex
        .from('users')
        .where('email', '=', identity)
        .orWhere('member_number', '=', identity);
      if (response.length === 0) {
        throw Error('No user found');
      }
      return response[0];
    },
  },
);

module.exports = User;
