exports.up = (knex) =>
  knex.schema.createTable('users', (t) => {
    t.increments('userId').primary();
    t.integer('memberNumber').unsigned().unique().notNullable();
    t.string('email').unique().notNullable();
    t.string('password_digest').notNullable();
    t.string('name');
    t.string('surname');
    t.string('role');
    t.timestamps();
  });

exports.down = (knex) => knex.schema.dropTableIfExists('users');
