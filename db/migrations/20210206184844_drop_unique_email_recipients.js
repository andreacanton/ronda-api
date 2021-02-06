exports.up = (knex) =>
  knex.schema.table('recipients', (table) => {
    table.dropUnique('email');
  });

exports.down = (knex) =>
  knex.schema.table('recipients', (table) => {
    table.unique('email');
  });
