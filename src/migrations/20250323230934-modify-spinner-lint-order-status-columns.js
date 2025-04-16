'use strict';

/** @type {import('sequelize-cli').Migration} */
module.exports = {
  async up(queryInterface, Sequelize) {
    // Remove the existing status column
    const tableInfo = await queryInterface.describeTable('spinner_place_lint_orders');
    if (tableInfo.status) {
      await queryInterface.removeColumn('spinner_place_lint_orders', 'status');
    }


    // Add new status columns
    await queryInterface.addColumn('spinner_place_lint_orders', 'spinner_status', {
      type: Sequelize.ENUM('pending', 'approved', 'rejected', 'lint_dispatch'),
      defaultValue: 'pending',
      allowNull: false
    });

    await queryInterface.addColumn('spinner_place_lint_orders', 'spinner_status_updated_at', {
      type: Sequelize.DATE,
      allowNull: true
    });

    await queryInterface.addColumn('spinner_place_lint_orders', 'ginner_status', {
      type: Sequelize.ENUM('pending', 'approved', 'rejected'),
      defaultValue: 'pending',
      allowNull: false
    });

    await queryInterface.addColumn('spinner_place_lint_orders', 'ginner_status_updated_at', {
      type: Sequelize.DATE,
      allowNull: true
    });

    await queryInterface.addColumn('spinner_place_lint_orders', 'brand_status', {
      type: Sequelize.ENUM('pending', 'approved', 'rejected'),
      defaultValue: 'pending',
      allowNull: false
    });

    await queryInterface.addColumn('spinner_place_lint_orders', 'brand_status_updated_at', {
      type: Sequelize.DATE,
      allowNull: true
    });
  },

  async down(queryInterface, Sequelize) {
    // Remove the new columns
    await queryInterface.removeColumn('spinner_place_lint_orders', 'spinner_status');
    await queryInterface.removeColumn('spinner_place_lint_orders', 'spinner_status_updated_at');
    await queryInterface.removeColumn('spinner_place_lint_orders', 'ginner_status');
    await queryInterface.removeColumn('spinner_place_lint_orders', 'ginner_status_updated_at');
    await queryInterface.removeColumn('spinner_place_lint_orders', 'brand_status');
    await queryInterface.removeColumn('spinner_place_lint_orders', 'brand_status_updated_at');
  }
};