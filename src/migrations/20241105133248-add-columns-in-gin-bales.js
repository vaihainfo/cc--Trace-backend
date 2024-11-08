'use strict';

/** @type {import('sequelize-cli').Migration} */
module.exports = {
  async up (queryInterface, Sequelize) {
    /**
     * Add altering commands here.
     *
     * Example:
     * await queryInterface.createTable('users', { id: Sequelize.INTEGER });
     */
    await queryInterface.addColumn('gin-bales', 'te_verified_weight', {
      type: Sequelize.DOUBLE
    });

    await queryInterface.addColumn('gin-bales', 'te_verified_status', {
      type: Sequelize.BOOLEAN
    });

    await queryInterface.addColumn('gin_processes', 'te_verified_total_qty', {
      type: Sequelize.DOUBLE
    });
    await queryInterface.addColumn('gin_processes', 'te_verified_bales', {
      type: Sequelize.DOUBLE
    });

    await queryInterface.addColumn('gin_processes', 'te_verified_status', {
      type: Sequelize.BOOLEAN
    });
  },

  async down (queryInterface, Sequelize) {
    await queryInterface.removeColumn('gin-bales', 'te_verified_weight');
    await queryInterface.removeColumn('gin-bales', 'te_verified_status');
    await queryInterface.removeColumn('gin_processes', 'te_verified_status');
    await queryInterface.removeColumn('gin_processes', 'te_verified_total_qty');
    await queryInterface.removeColumn('gin_processes', 'te_verified_bales');
  }
};
