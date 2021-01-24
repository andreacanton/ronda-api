exports.up = (knex) =>
  knex.schema.createTable('recipients', (t) => {
    t.increments('recipient_id').primary();
    t.string('card_number').unique().notNullable();
    t.string('email').unique().notNullable();
    t.string('firstname');
    t.string('lastname');
    t.string('phone_number');
    t.string('gender');
    t.string('top_size');
    t.string('bottom_size');
    t.string('shoe_size');
    t.timestamps(false, true);
  });

exports.down = (knex) => knex.schema.dropTableIfExists('recipients');
