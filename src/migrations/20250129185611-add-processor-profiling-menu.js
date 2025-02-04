'use strict';

/** @type {import('sequelize-cli').Migration} */
module.exports = {
  async up(queryInterface, Sequelize) {
    await queryInterface.bulkInsert('menu_lists', [{
      menu_name: 'Processor Profiling',
      categories_allowed: [1],
      createdAt: new Date(),
      updatedAt: new Date()
    }], {});
  },

  async down(queryInterface, Sequelize) {
    await queryInterface.bulkDelete('menu_lists', {
      menu_name: 'Processor Profiling'
    }, {});
  }
};
