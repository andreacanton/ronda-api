exports.up = (knex) =>
  knex.schema.table('recipients', (table) => {
    table.string('status').after('shoe_size').notNullable().defaultTo('enabled');
  });

exports.down = (knex) =>
  knex.schema.table('recipients', (table) => {
    table.dropColumn('status');
  });
