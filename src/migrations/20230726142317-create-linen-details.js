'use strict';
/** @type {import('sequelize-cli').Migration} */
module.exports = {
  async up(queryInterface, Sequelize) {
    await queryInterface.createTable('linen_details', {
      id: {
        allowNull: false,
        autoIncrement: true,
        primaryKey: true,
        type: Sequelize.INTEGER
      },
      season_id: {
        type: Sequelize.INTEGER
      },
      harvest: {
        type: Sequelize.STRING
      },
      farmer_no: {
        type: Sequelize.STRING
      },
      farmer_name: {
        type: Sequelize.STRING
      },
      country: {
        type: Sequelize.STRING
      },
      town: {
        type: Sequelize.STRING
      },
      department: {
        type: Sequelize.STRING
      },
      area: {
        type: Sequelize.STRING
      },
      linen_variety: {
        type: Sequelize.STRING
      },
      cooperative_name: {
        type: Sequelize.STRING
      },
      no_of_bales: {
        type: Sequelize.INTEGER
      },
      farm_lot_no: {
        type: Sequelize.STRING
      },
      total_weight: {
        type: Sequelize.STRING
      },
      scutch_date: {
        type: Sequelize.DATE
      },
      scutching_lot_no: {
        type: Sequelize.STRING
      },
      bales_after_scutching: {
        type: Sequelize.INTEGER
      },
      weight_after_scutching: {
        type: Sequelize.DOUBLE
      },
      shipment_date: {
        type: Sequelize.DATE
      },
      shipment_details: {
        type: Sequelize.TEXT
      },
      shiped_to: {
        type: Sequelize.TEXT
      },
      qty_stock: {
        type: Sequelize.DOUBLE
      },
      program_id: {
        type: Sequelize.INTEGER
      },
      status: {
        type: Sequelize.STRING
      },
      createdAt: {
        allowNull: false,
        type: Sequelize.DATE
      },
      updatedAt: {
        allowNull: false,
        type: Sequelize.DATE
      }
    });
  },
  async down(queryInterface, Sequelize) {
    await queryInterface.dropTable('linen_details');
  }
};