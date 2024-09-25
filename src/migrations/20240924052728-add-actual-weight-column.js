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
    await queryInterface.addColumn('gin-bales', 'accepted_weight', {
      type: Sequelize.DOUBLE,
      // defaultValue: true,
      });

      await queryInterface.addColumn('gin_sales', 'accepted_bales_weight', {
        type: Sequelize.DOUBLE,
        // defaultValue: true,
        });

  },

  async down (queryInterface, Sequelize) {
    /**
     * Add reverting commands here.
     *
     * Example:
     * await queryInterface.dropTable('users');
     */
    await queryInterface.removeColumn('gin-bales', 'accepted_weight');
    await queryInterface.removeColumn('gin_sales', 'accepted_bales_weight');
  }
};
