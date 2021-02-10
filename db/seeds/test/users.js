const bcrypt = require('bcrypt');

exports.seed = async (knex) => {
  await knex('users').del();
  const digest = bcrypt.hashSync('password01', 12);
  await knex('users').insert([
    {
      user_id: 1,
      member_number: 1072,
      email: 'asurname@test.com',
      password_digest: digest,
      firstname: 'A',
      lastname: 'ASurname',
      role: 'admin',
      status: 'enabled',
    },
    {
      user_id: 2,
      member_number: 102,
      email: 'bsurname@test.com',
      password_digest: digest,
      firstname: 'B',
      lastname: 'BSurname',
      role: 'member',
      status: 'enabled',
    },
    {
      user_id: 3,
      member_number: 574,
      email: 'csurname@test.com',
      password_digest: digest,
      firstname: 'C',
      lastname: 'CSurname',
      role: 'member',
      status: 'enabled',
    },
  ]);
};
