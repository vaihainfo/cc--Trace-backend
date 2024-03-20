"use strict";

/** @type {import('sequelize-cli').Migration} */
module.exports = {
  async up(queryInterface, Sequelize) {
    /**
     * Add altering commands here.
     *
     * Example:
     * await queryInterface.createTable('users', { id: Sequelize.INTEGER });
     */
    // await queryInterface.addColumn('export_ginner_lintbale_sales', 'createdAt', {
    //   type: Sequelize.DATE,
    // });
    // await queryInterface.addColumn('export_ginner_lintbale_sales', 'updatedAt', {
    //   type: Sequelize.DATE
    // });
  },

  async down(queryInterface, Sequelize) {
    /**
     * Add reverting commands here.
     *
     * Example:
     * await queryInterface.dropTable('users');
     */
    // await queryInterface.removeColumn('export_ginner_lintbale_sales', 'createdAt');
    // await queryInterface.removeColumn('export_ginner_lintbale_sales', 'updatedAt');
  },
};
