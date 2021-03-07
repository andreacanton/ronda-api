module.exports = async (knex) =>
  knex('items')
    .truncate()
    .then(() =>
      knex('items').insert([
        { name: 'Maglietta', size_category: 'top' },
        { name: 'Maglione', size_category: 'top' },
        { name: 'Felpa', size_category: 'top' },
        { name: 'Giubbotto', size_category: 'top' },
        { name: 'Canottiera', size_category: 'top' },
        { name: 'Scarpe', size_category: 'shoes' },
        { name: 'Pantaloni', size_category: 'trousers' },
        { name: 'Mutande', size_category: 'bottom' },
        { name: 'Reggiseno', size_category: 'bra' },
        { name: 'Zaino' },
        { name: 'Berretto' },
        { name: 'Sacco a pelo' },
        { name: 'Coperta' },
      ]),
    );
