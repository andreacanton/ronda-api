exports.seed = async (knex) => {
  await knex('users').del();
  await knex('users').insert([
    {
      userId: 1,
      memberNumber: 1072,
      email: 'asurname@test.com',
      password_digest: '123456789876543',
      name: 'A',
      surname: 'ASurname',
      role: 'admin',
    },
    {
      userId: 2,
      memberNumber: 1070,
      email: 'bsurname@test.com',
      password_digest: 'asdfasdfasdfasdfasd',
      name: 'B',
      surname: 'BSurname',
      role: 'member',
    },
    {
      userId: 3,
      memberNumber: 1071,
      email: 'csurname@test.com',
      password_digest: 'nugoniugrnuirgnurglniualb4iu',
      name: 'C',
      surname: 'CSurname',
      role: 'member',
    },
  ]);
};
