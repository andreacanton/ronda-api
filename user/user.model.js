const _ = require('lodash');
const CheckIt = require('checkit');
const orm = require('../db');

const AVAILABLE_ROLES = ['member', 'admin'];
const AVAILABLE_STATUSES = ['enabled', 'disabled'];

const User = orm.model(
  'User',
  {
    tableName: 'users',
    idAttribute: 'user_id',
    hasSecurePassword: 'passwordDigest',
    hasTimestamps: true,
    defaults: {
      role: 'member',
    },
    initialize() {
      this.on(
        'creating',
        () =>
          CheckIt({
            email: ['required', 'email'],
            role: ['required'],
            memberNumber: ['required'],
            passwordDigest: ['required'],
          }).run(this.attributes),
      );
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
              if (exists) {
                throw new Error('Member Number already registered');
              }
            }),
        ],
        email: [
          'email',
          (value) =>
            User.isFieldTaken('email', value, this.attributes.userId).then(
              (exists) => {
                if (exists) {
                  throw new Error('Email already registered');
                }
              },
            ),
        ],
        role: (value) => AVAILABLE_ROLES.includes(value),
        status: (value) => AVAILABLE_STATUSES.includes(value),
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
        query = query.where('user_id', '!=', userId);
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
    fetchWithFilters({
      search,
      page = 1,
      pageSize = 20,
      status,
      sort,
      direction = 'ASC',
    }) {
      let query = this.query();
      if (search) {
        query = query
          .where('firstname', 'LIKE', `%${search}%`)
          .orWhere('lastname', 'LIKE', `%${search}%`)
          .orWhere('email', 'LIKE', `%${search}%`)
          .orWhere('member_number', 'LIKE', `%${search}%`);
      }
      if (status) {
        query = query.where('status', '=', status);
      }
      if (sort) {
        query = query.orderBy(_.snakeCase(sort), direction);
      }
      return query.limit(pageSize).offset((pageSize * (page - 1)));
    },
  },
);

module.exports = User;
