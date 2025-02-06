'use strict';

/** @type {import('sequelize-cli').Migration} */
module.exports = {
  async up (queryInterface, Sequelize) {

    await queryInterface.addColumn('gin-bales', 'gin_level_verify', {
      type: Sequelize.BOOLEAN
    });

    await queryInterface.addColumn('gin-bales', 'spin_level_verify', {
      type: Sequelize.BOOLEAN
    });

    await queryInterface.addColumn('gin-bales', 'te_sale_verified_weight', {
      type: Sequelize.DOUBLE
    });

    await queryInterface.addColumn('gin-bales', 'te_sale_verified_status', {
      type: Sequelize.BOOLEAN
    });

    await queryInterface.addColumn('gin_sales', 'te_verified_total_qty', {
      type: Sequelize.DOUBLE
    });
    await queryInterface.addColumn('gin_sales', 'te_verified_bales', {
      type: Sequelize.DOUBLE
    });

    await queryInterface.addColumn('gin_sales', 'te_verified_status', {
      type: Sequelize.BOOLEAN
    });

    await queryInterface.addColumn('gin-bales', 'spin_verified_weight', {
      type: Sequelize.DOUBLE
    });

    await queryInterface.addColumn('gin-bales', 'spin_verified_status', {
      type: Sequelize.BOOLEAN
    });

    await queryInterface.addColumn('gin_sales', 'spin_verified_total_qty', {
      type: Sequelize.DOUBLE
    });
    await queryInterface.addColumn('gin_sales', 'spin_verified_bales', {
      type: Sequelize.DOUBLE
    });

    await queryInterface.addColumn('gin_sales', 'spin_verified_status', {
      type: Sequelize.BOOLEAN
    });

    await queryInterface.addColumn('gin-bales', 'be_verified_weight', {
      type: Sequelize.DOUBLE
    });

    await queryInterface.addColumn('gin-bales', 'be_verified_status', {
      type: Sequelize.BOOLEAN
    });

    await queryInterface.addColumn('gin_sales', 'be_verified_total_qty', {
      type: Sequelize.DOUBLE
    });
    await queryInterface.addColumn('gin_sales', 'be_verified_bales', {
      type: Sequelize.DOUBLE
    });

    await queryInterface.addColumn('gin_sales', 'be_verified_status', {
      type: Sequelize.BOOLEAN
    });

    await queryInterface.addColumn('gin-bales', 'bm_verified_weight', {
      type: Sequelize.DOUBLE
    });

    await queryInterface.addColumn('gin-bales', 'bm_verified_status', {
      type: Sequelize.BOOLEAN
    });

    await queryInterface.addColumn('gin_sales', 'bm_verified_total_qty', {
      type: Sequelize.DOUBLE
    });
    await queryInterface.addColumn('gin_sales', 'bm_verified_bales', {
      type: Sequelize.DOUBLE
    });

    await queryInterface.addColumn('gin_sales', 'bm_verified_status', {
      type: Sequelize.BOOLEAN
    });


    await queryInterface.addColumn('gin-bales', 'ps_verified_weight', {
      type: Sequelize.DOUBLE
    });

    await queryInterface.addColumn('gin-bales', 'ps_verified_status', {
      type: Sequelize.BOOLEAN
    });

    await queryInterface.addColumn('gin_sales', 'ps_verified_total_qty', {
      type: Sequelize.DOUBLE
    });
    await queryInterface.addColumn('gin_sales', 'ps_verified_bales', {
      type: Sequelize.DOUBLE
    });

    await queryInterface.addColumn('gin_sales', 'ps_verified_status', {
      type: Sequelize.BOOLEAN
    });
  },

  async down (queryInterface, Sequelize) {
    await queryInterface.removeColumn('gin-bales', 'gin_level_verify');
    await queryInterface.removeColumn('gin-bales', 'spin_level_verify');

    await queryInterface.removeColumn('gin-bales', 'spin_verified_weight');
    await queryInterface.removeColumn('gin-bales', 'spin_verified_status');
    await queryInterface.removeColumn('gin_sales', 'spin_verified_status');
    await queryInterface.removeColumn('gin_sales', 'spin_verified_total_qty');
    await queryInterface.removeColumn('gin_sales', 'spin_verified_bales');

    await queryInterface.removeColumn('gin-bales', 'te_sale_verified_weight');
    await queryInterface.removeColumn('gin-bales', 'te_sale_verified_status');
    await queryInterface.removeColumn('gin_sales', 'te_verified_status');
    await queryInterface.removeColumn('gin_sales', 'te_verified_total_qty');
    await queryInterface.removeColumn('gin_sales', 'te_verified_bales');

    await queryInterface.removeColumn('gin-bales', 'be_verified_weight');
    await queryInterface.removeColumn('gin-bales', 'be_verified_status');
    await queryInterface.removeColumn('gin_sales', 'be_verified_status');
    await queryInterface.removeColumn('gin_sales', 'be_verified_total_qty');
    await queryInterface.removeColumn('gin_sales', 'be_verified_bales');

    await queryInterface.removeColumn('gin-bales', 'bm_verified_weight');
    await queryInterface.removeColumn('gin-bales', 'bm_verified_status');
    await queryInterface.removeColumn('gin_sales', 'bm_verified_status');
    await queryInterface.removeColumn('gin_sales', 'bm_verified_total_qty');
    await queryInterface.removeColumn('gin_sales', 'bm_verified_bales');

    await queryInterface.removeColumn('gin-bales', 'ps_verified_weight');
    await queryInterface.removeColumn('gin-bales', 'ps_verified_status');
    await queryInterface.removeColumn('gin_sales', 'ps_verified_status');
    await queryInterface.removeColumn('gin_sales', 'ps_verified_total_qty');
    await queryInterface.removeColumn('gin_sales', 'ps_verified_bales');
  }
};
