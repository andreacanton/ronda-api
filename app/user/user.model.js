const _ = require('lodash');
const CheckIt = require('checkit');
const { v4: uuidV4 } = require('uuid');
const orm = require('../../db');

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
      this.on('creating', () => {
        this.set('userId', uuidV4());
      });
      this.on('saving', this.validateSave);
    },
    validateSave() {
      return CheckIt({
        passwordDigest: ['required'],
        memberNumber: [
          'required',
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
          'required',
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
        role: ['required', (value) => AVAILABLE_ROLES.includes(value)],
        status: ['required', (value) => AVAILABLE_STATUSES.includes(value)],
      }).run(this.attributes);
    },
    parse(response) {
      return _.mapKeys(response, (value, key) => _.camelCase(key));
    },
    format(attributes) {
      return _.mapKeys(attributes, (value, key) => _.snakeCase(key));
    },
    tokens() {
      return this.hasMany('Token');
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
    fetchWithFilters({
      search,
      page = 1,
      pageSize = 20,
      role,
      status,
      sort,
      direction = 'ASC',
    }) {
      return this.query((queryBuilder) => {
        let query = queryBuilder;
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
        if (role) {
          query = query.where('role', '=', role);
        }
        if (sort) {
          query = query.orderBy(_.snakeCase(sort), direction);
        }
        return query;
      }).fetchPage({
        page,
        pageSize,
      });
    },
  },
);

module.exports = User;
