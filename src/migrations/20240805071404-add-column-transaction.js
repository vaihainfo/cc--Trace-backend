'use strict';

/** @type {import('sequelize-cli').Migration} */
module.exports = {
  async up (queryInterface, Sequelize) {
    // await queryInterface.removeColumn('transactions', 'heap_status');
    await queryInterface.addColumn('transactions', 'heap_status', {
      type: Sequelize.STRING,
      defaultValue: null
    });
  },

  async down (queryInterface, Sequelize) {
    await queryInterface.removeColumn('transactions', 'heap_status');
  }
};
