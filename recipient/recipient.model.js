const _ = require('lodash');
const CheckIt = require('checkit');
const orm = require('../db');

const Recipient = orm.model(
  'Recipient',
  {
    tableName: 'recipients',
    idAttribute: 'recipient_id',
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

      this.on('updating', () => {
        this.attributes.updatedAt = new Date();
      });
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
        .from('recipients')
        .where(_.snakeCase(fieldName), '=', fieldValue);
      if (userId) {
        query = query.where('recipient_id', '!=', userId);
      }
      const resp = await query;
      return resp.length > 0;
    },
  },
);

module.exports = Recipient;
