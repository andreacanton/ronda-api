exports.up = (knex) =>
  knex.schema.createTable('orders', (t) => {
    t.increments('order_id').primary();
    t.string('order_number').notNullable();
    t.integer('recipient_id').unsigned().notNullable();
    t.string('destination').notNullable();
    t.timestamps(false, true);
    t.foreign('recipient_id').references('recipient_id').inTable('recipients');
  });

exports.down = (knex) => knex.schema.dropTableIfExists('orders');
