exports.up = (knex) =>
  knex.schema.table('users', (table) => {
    table.string('status').after('role').notNullable().defaultTo('enabled');
  });

exports.down = (knex) =>
  knex.schema.table('users', (table) => {
    table.dropColumn('status');
  });
