'use strict';

/** @type {import('sequelize-cli').Migration} */
module.exports = {
  async up (queryInterface, Sequelize) {
    await queryInterface.addColumn('lint_stock_verifieds', 'confirmed_gin_total_qty', {
      type: Sequelize.DOUBLE
    });

    await queryInterface.addColumn('lint_stock_verifieds', 'confirmed_gin_no_of_bales', {
      type: Sequelize.DOUBLE
    });

    await queryInterface.addColumn('lint_stock_verifieds', 'confirmed_scm_total_qty', {
      type: Sequelize.DOUBLE
    });

    await queryInterface.addColumn('lint_stock_verifieds', 'confirmed_scm_no_of_bales', {
      type: Sequelize.DOUBLE
    });

    await queryInterface.addColumn('lint_stock_verifieds', 'confirmed_scd_total_qty', {
      type: Sequelize.DOUBLE
    });

    await queryInterface.addColumn('lint_stock_verifieds', 'confirmed_scd_no_of_bales', {
      type: Sequelize.DOUBLE
    });

    await queryInterface.addColumn('gin-bales', 'gin_verified_weight', {
      type: Sequelize.DOUBLE
    });

    await queryInterface.addColumn('gin-bales', 'gin_verified_status', {
      type: Sequelize.BOOLEAN
    });

    await queryInterface.addColumn('gin_processes', 'gin_verified_total_qty', {
      type: Sequelize.DOUBLE
    });
    await queryInterface.addColumn('gin_processes', 'gin_verified_bales', {
      type: Sequelize.DOUBLE
    });

    await queryInterface.addColumn('gin_processes', 'gin_verified_status', {
      type: Sequelize.BOOLEAN
    });

    await queryInterface.addColumn('gin-bales', 'scm_verified_weight', {
      type: Sequelize.DOUBLE
    });

    await queryInterface.addColumn('gin-bales', 'scm_verified_status', {
      type: Sequelize.BOOLEAN
    });

    await queryInterface.addColumn('gin_processes', 'scm_verified_total_qty', {
      type: Sequelize.DOUBLE
    });
    await queryInterface.addColumn('gin_processes', 'scm_verified_bales', {
      type: Sequelize.DOUBLE
    });

    await queryInterface.addColumn('gin_processes', 'scm_verified_status', {
      type: Sequelize.BOOLEAN
    });

    await queryInterface.addColumn('gin-bales', 'scd_verified_weight', {
      type: Sequelize.DOUBLE
    });

    await queryInterface.addColumn('gin-bales', 'scd_verified_status', {
      type: Sequelize.BOOLEAN
    });

    await queryInterface.addColumn('gin_processes', 'scd_verified_total_qty', {
      type: Sequelize.DOUBLE
    });
    await queryInterface.addColumn('gin_processes', 'scd_verified_bales', {
      type: Sequelize.DOUBLE
    });

    await queryInterface.addColumn('gin_processes', 'scd_verified_status', {
      type: Sequelize.BOOLEAN
    });

  },

  async down (queryInterface, Sequelize) {
    await queryInterface.removeColumn('gin-bales', 'gin_verified_weight');
    await queryInterface.removeColumn('gin-bales', 'gin_verified_status');
    await queryInterface.removeColumn('gin_processes', 'gin_verified_status');
    await queryInterface.removeColumn('gin_processes', 'gin_verified_total_qty');
    await queryInterface.removeColumn('gin_processes', 'gin_verified_bales');

    await queryInterface.removeColumn('gin-bales', 'scm_verified_weight');
    await queryInterface.removeColumn('gin-bales', 'scm_verified_status');
    await queryInterface.removeColumn('gin_processes', 'scm_verified_status');
    await queryInterface.removeColumn('gin_processes', 'scm_verified_total_qty');
    await queryInterface.removeColumn('gin_processes', 'scm_verified_bales');

    await queryInterface.removeColumn('gin-bales', 'scd_verified_weight');
    await queryInterface.removeColumn('gin-bales', 'scd_verified_status');
    await queryInterface.removeColumn('gin_processes', 'scd_verified_status');
    await queryInterface.removeColumn('gin_processes', 'scd_verified_total_qty');
    await queryInterface.removeColumn('gin_processes', 'scd_verified_bales');

    await queryInterface.removeColumn('lint_stock_verifieds', 'confirmed_gin_total_qty');
    await queryInterface.removeColumn('lint_stock_verifieds', 'confirmed_gin_no_of_bales');
    await queryInterface.removeColumn('lint_stock_verifieds', 'confirmed_scm_total_qty');
    await queryInterface.removeColumn('lint_stock_verifieds', 'confirmed_scm_no_of_bales');
    await queryInterface.removeColumn('lint_stock_verifieds', 'confirmed_scd_total_qty');
    await queryInterface.removeColumn('lint_stock_verifieds', 'confirmed_scd_no_of_bales');
  }
};
