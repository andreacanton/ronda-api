const CheckIt = require('checkit');
const orm = require('../db');

const AVAILABLE_ROLES = ['member', 'admin'];

const User = orm.model('User', {
  tableName: 'users',
  idAttribute: 'userId',
  hasSecurePassword: true,
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
          password_digest: ['required'],
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
            .where('memberNumber', '=', value)
            .where('userId', '!=', this.attributes.userId)
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
            .where('userId', '!=', this.attributes.userId)
            .then((resp) => {
              if (resp.length > 0)
                // eslint-disable-next-line nonblock-statement-body-position
                throw new Error('Email already registered');
            }),
      ],
      role: (value) => AVAILABLE_ROLES.includes(value),
    }).run(this.attributes);
  },
});

module.exports = User;
