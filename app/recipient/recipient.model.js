const _ = require('lodash');
const CheckIt = require('checkit');
const orm = require('../../db');

const AVAILABLE_STATUSES = ['enabled', 'disabled'];

const Recipient = orm.model(
  'Recipient',
  {
    tableName: 'recipients',
    idAttribute: 'recipient_id',
    hasTimestamps: true,
    initialize() {
      this.on(
        'creating',
        () =>
          CheckIt({
            email: ['email'],
            cardNumber: ['required'],
          }).run(this.attributes),
        // eslint-disable-next-line function-paren-newline
      );
      this.on('saving', this.validateSave);
    },
    validateSave() {
      return CheckIt({
        cardNumber: [
          (value) =>
            Recipient.isFieldTaken(
              'cardNumber',
              value,
              this.attributes.recipientId,
            ).then((exists) => {
              if (exists)
                // eslint-disable-next-line nonblock-statement-body-position
                throw new Error('Card Number already registered');
            }),
        ],
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
    async isFieldTaken(fieldName, fieldValue, recipientId = null) {
      let query = orm.knex
        .from('recipients')
        .where(_.snakeCase(fieldName), '=', fieldValue);
      if (recipientId) {
        query = query.where('recipient_id', '!=', recipientId);
      }
      const resp = await query;
      return resp.length > 0;
    },
    fetchWithFilters({
      search,
      page = 1,
      pageSize = 20,
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
            .orWhere('card_number', 'LIKE', `%${search}%`);
        }
        if (status) {
          query = query.where('status', '=', status);
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

module.exports = Recipient;
