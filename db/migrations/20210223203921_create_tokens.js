const { v4: uuidV4 } = require('uuid');

exports.up = (knex) =>
  knex.schema.createTable('tokens', (t) => {
    t.string('token_id', 36).primary().defaultTo(uuidV4());
    t.string('type').notNullable();
    t.datetime('expiration').notNullable();
    t.timestamps(false, true);
  });

exports.down = (knex) => knex.schema.dropTableIfExists('tokens');
