const bcrypt = require('bcrypt');

exports.seed = async (knex) => {
  await knex('users').del();
  const salt = bcrypt.genSaltSync(12);
  await knex('users').insert([
    {
      user_id: 1,
      member_number: 1072,
      email: 'andrea@test.com',
      password_digest: bcrypt.hashSync('ficcante', salt),
      firstname: 'Andrea',
      lastname: 'Canton',
      role: 'admin',
      status: 'enabled',
    },
    {
      user_id: 2,
      member_number: 1073,
      email: 'fernando@test.com',
      password_digest: bcrypt.hashSync('pollos', salt),
      firstname: 'Fernando',
      lastname: 'Montero',
      role: 'admin',
      status: 'enabled',
    },
  ]);
};
