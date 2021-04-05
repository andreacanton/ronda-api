exports.up = (knex) =>
  knex.schema.createTable('order_notes', (t) => {
    t.increments('note_id').primary();
    t.integer('order_id').unsigned().notNullable();
    t.string('user_id', 36).notNullable();
    t.string('phase');
    t.text('body');
    t.timestamps(false, true);
    t.foreign('order_id').references('order_id').inTable('orders');
    t.foreign('user_id').references('user_id').inTable('users');
  });

exports.down = (knex) => knex.schema.dropTableIfExists('order_notes');
