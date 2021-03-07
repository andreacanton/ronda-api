const bcrypt = require('bcrypt');

exports.seed = (knex) =>
  knex('tokens')
    .truncate()
    .then(() =>
      knex('users')
        .truncate()
        .then(() => {
          const digest = bcrypt.hashSync('password01', 12);
          return knex('users').insert([
            {
              user_id: 'abf65ce3-1a02-475a-a434-dcda9131f068',
              member_number: 1072,
              email: 'asurname@test.com',
              password_digest: digest,
              firstname: 'A',
              lastname: 'ASurname',
              role: 'admin',
              status: 'enabled',
            },
            {
              user_id: '2272e61b-59b5-4da3-9ab6-27c804930ca5',
              member_number: 102,
              email: 'bsurname@test.com',
              password_digest: digest,
              firstname: 'B',
              lastname: 'BSurname',
              role: 'member',
              status: 'enabled',
            },
            {
              user_id: '28416a42-b4d4-4620-8004-b73532b8b2d8',
              member_number: 574,
              email: 'csurname@test.com',
              password_digest: digest,
              firstname: 'C',
              lastname: 'CSurname',
              role: 'member',
              status: 'enabled',
            },
          ]);
        }));
