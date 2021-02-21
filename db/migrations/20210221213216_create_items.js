exports.up = (knex) =>
  knex.schema.createTable('items', (t) => {
    t.increments('item_id').primary();
    t.string('name').notNullable();
    t.string('size_category');
    t.timestamps(false, true);
  });

exports.down = (knex) => knex.schema.dropTableIfExists('items');
