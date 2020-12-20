const checkit = require('checkit');
const bookshelf = require('../db');

const AVAILABLE_ROLES = ['member', 'admin'];

const User = bookshelf.model('User', {
  tableName: 'users',
  hasSecurePassword: true,
  defaults: {
    role: 'member',
  },
  initialize() {
    this.on('saving', this.validateSave);
  },
  validateSave() {
    return checkit({
      memberNumber: [
        'required',
        'integer',
        (value) =>
          this.knex('users')
            .where('memberNumber', '=', value)
            .then((resp) => {
              if (resp.length > 0)
                // eslint-disable-next-line nonblock-statement-body-position
                throw new Error('Member Number already registered');
            }),
      ],
      email: [
        'required',
        'email',
        (value) =>
          this.knex('users')
            .where('email', '=', value)
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
