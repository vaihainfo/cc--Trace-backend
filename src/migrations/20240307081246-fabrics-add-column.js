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
    await queryInterface.addColumn('dying_sales', 'sales_type', {
      type: Sequelize.STRING
    });
    await queryInterface.addColumn('printing_sales', 'sales_type', {
      type: Sequelize.STRING
    });
    await queryInterface.addColumn('washing_sales', 'sales_type', {
      type: Sequelize.STRING
    });
    await queryInterface.addColumn('compacting_sales', 'sales_type', {
      type: Sequelize.STRING
    });
  },

  async down (queryInterface, Sequelize) {
    /**
     * Add reverting commands here.
     *
     * Example:
     * await queryInterface.dropTable('users');
     */
    await queryInterface.removeColumn('dying_sales', 'sales_type');
    await queryInterface.addColumn('printing_sales', 'sales_type');
    await queryInterface.addColumn('washing_sales', 'sales_type');
    await queryInterface.addColumn('compacting_sales', 'sales_type');
  }
};
