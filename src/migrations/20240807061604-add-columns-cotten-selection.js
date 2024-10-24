'use strict';

/** @type {import('sequelize-cli').Migration} */
module.exports = {
  async up (queryInterface, Sequelize) {
    // await queryInterface.removeColumn('transactions', 'heap_status');
    await queryInterface.addColumn('cotton_selections', 'status', {
      type: Sequelize.BOOLEAN
    });
  },

  async down (queryInterface, Sequelize) {
    await queryInterface.removeColumn('cotton_selections', 'status');
  }
};
