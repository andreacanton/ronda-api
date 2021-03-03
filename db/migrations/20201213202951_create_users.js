exports.up = (knex) =>
  knex.schema.createTable('users', (t) => {
    t.string('user_id', 36).primary();
    t.integer('member_number')
      .unsigned()
      .unique()
      .notNullable();
    t.string('email')
      .unique()
      .notNullable();
    t.string('password_digest').notNullable();
    t.string('firstname');
    t.string('lastname');
    t.string('role');
    t.timestamps(false, true);
  });

exports.down = (knex) => knex.schema.dropTableIfExists('users');
