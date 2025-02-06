'use strict';

/** @type {import('sequelize-cli').Migration} */
module.exports = {
  async up (queryInterface, Sequelize) {
    await queryInterface.addColumn('gin_sales', 'buyer_type', {
      type: Sequelize.STRING
    });

    await queryInterface.addColumn('gin_sales', 'buyer_ginner', {
      type: Sequelize.INTEGER
    });

    await queryInterface.addColumn('bale_selections', 'ginner_status', {
      type: Sequelize.BOOLEAN
    });

    await queryInterface.addColumn('bale_selections', 'gin_to_gin_sale', {
      type: Sequelize.BOOLEAN
    });

    await queryInterface.addColumn('gin-bales', 'is_gin_to_gin_sale', {
      type: Sequelize.BOOLEAN
    });

    await queryInterface.addColumn('gin-bales', 'gin_to_gin_status', {
      type: Sequelize.BOOLEAN
    });

    await queryInterface.addColumn('gin-bales', 'sold_by_sales_id', {
      type: Sequelize.INTEGER
    });
  },

  async down (queryInterface, Sequelize) {
    await queryInterface.removeColumn('gin_sales', 'buyer_type');
    await queryInterface.removeColumn('gin_sales', 'buyer_ginner');
    await queryInterface.removeColumn('bale_selections', 'ginner_status');
    await queryInterface.removeColumn('gin-bales', 'is_gin_to_gin_sale');
    await queryInterface.removeColumn('gin-bales', 'gin_to_gin_status');
    await queryInterface.removeColumn('gin-bales', 'sold_by_sales_id');
  }
};
