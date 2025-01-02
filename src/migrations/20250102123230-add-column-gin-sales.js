'use strict';

/** @type {import('sequelize-cli').Migration} */
module.exports = {
  async up (queryInterface, Sequelize) {
    await queryInterface.addColumn('gin_sales', 'greyed_out_qty', {
      type: Sequelize.DOUBLE
    });

    await queryInterface.addColumn('gin_sales', 'qty_stock_before_verification', {
      type: Sequelize.DOUBLE
    });
  },

  async down (queryInterface, Sequelize) {
    await queryInterface.removeColumn('gin_sales', 'greyed_out_qty');
    await queryInterface.removeColumn('gin_sales', 'qty_stock_before_verification');
  }
};