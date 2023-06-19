const bcrypt = require('bcrypt');

module.exports = {
  up: async (queryInterface, Sequelize) => {
    const encryptedPassword = await bcrypt.hash('Software12&', 12)
    await queryInterface.bulkInsert('users', [{
      name: 'Muhammad Al Fahad',
      email: 'al.fahad7240@gmail.com',
      city: 'Multan',
      password: encryptedPassword,
      dob: new Date('1990-05-21').toDateString(),
      phone: '03233668477',
      gender: 'Male',
      admin: true,
      created_at: new Date(),
      updated_at: new Date()
    }], {});
  },

  down: async (queryInterface, Sequelize) => {
    await queryInterface.bulkDelete('users', { email: 'al.fahad7240@gmail.com' }, {});
  }
};
