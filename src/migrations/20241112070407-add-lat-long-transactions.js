'use strict';

/** @type {import('sequelize-cli').Migration} */
module.exports = {
  async up (queryInterface, Sequelize) {
    await queryInterface.addColumn('transactions', 'latitude', {
      type: Sequelize.DOUBLE
    });
    await queryInterface.addColumn('transactions', 'longitude', {
      type: Sequelize.DOUBLE
    });
  },

  async down (queryInterface, Sequelize) {
    /**
     * Add reverting commands here.
     *
     * Example:
     * await queryInterface.dropTable('users');
     */
  }
};
