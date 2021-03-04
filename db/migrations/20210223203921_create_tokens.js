exports.up = (knex) =>
  knex.schema.createTable('tokens', (t) => {
    t.string('token_id', 36).primary();
    t.string('user_id', 36);
    t.string('type').notNullable();
    t.datetime('expiration').notNullable();
    t.timestamps(false, true);
    t.foreign('user_id').references('user_id').inTable('users');
  });

exports.down = (knex) => knex.schema.dropTableIfExists('tokens');
