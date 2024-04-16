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
    await queryInterface.dropTable("export_ginner_lintbale_processes");
    await queryInterface.dropTable("export_ginner_lintbale_sales");
    await queryInterface.dropTable("export_ginner_summaries");
    await queryInterface.dropTable("export_ginner_pending_sales");
    await queryInterface.dropTable("export_ginner_cotton_stocks");
    await queryInterface.dropTable("export_spinner_bale_receipts");
    await queryInterface.dropTable("export_spinner_lint_stocks");
    await queryInterface.dropTable("export_spinner_pending_bales");
    await queryInterface.dropTable("export_spinner_summaries");
    await queryInterface.dropTable("export_spinner_yarn_processes");
    await queryInterface.dropTable("export_spinner_yarn_sales");
  },

  async down (queryInterface, Sequelize) {
    /**
     * Add reverting commands here.
     *
     * Example:
     * await queryInterface.dropTable('users');
     */
    await queryInterface.dropTable("export_ginner_lintbale_processes");
    await queryInterface.dropTable("export_ginner_lintbale_sales");
    await queryInterface.dropTable("export_ginner_summaries");
    await queryInterface.dropTable("export_ginner_pending_sales");
    await queryInterface.dropTable("export_ginner_cotton_stocks");
    await queryInterface.dropTable("export_spinner_bale_receipts");
    await queryInterface.dropTable("export_spinner_lint_stocks");
    await queryInterface.dropTable("export_spinner_pending_bales");
    await queryInterface.dropTable("export_spinner_summaries");
    await queryInterface.dropTable("export_spinner_yarn_processes");
    await queryInterface.dropTable("export_spinner_yarn_sales");
  }
};
