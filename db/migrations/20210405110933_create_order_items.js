exports.up = (knex) =>
  knex.schema.createTable('order_items', (t) => {
    t.integer('order_id').unsigned().notNullable();
    t.integer('item_id').unsigned().notNullable();
    t.string('size');
    t.string('genre');
    t.integer('quantity');
    t.text('notes');
    t.primary(['order_id', 'item_id']);
    t.foreign('order_id').references('order_id').inTable('orders');
    t.foreign('item_id').references('item_id').inTable('items');
  });

exports.down = (knex) => knex.schema.dropTableIfExists('order_items');
