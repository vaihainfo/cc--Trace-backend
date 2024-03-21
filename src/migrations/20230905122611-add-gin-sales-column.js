'use strict';

/** @type {import('sequelize-cli').Migration} */
module.exports = {
  async up(queryInterface, Sequelize) {
    return await Promise.all([
      queryInterface.addColumn('gin_sales', 'qr', {
        type: Sequelize.STRING
      }),
      queryInterface.addColumn('gin_sales', 'weight_loss', {
        type: Sequelize.INTEGER
      }),
      queryInterface.addColumn('gin_sales', 'transporter_name', {
        type: Sequelize.STRING
      }),
      queryInterface.addColumn('gin_sales', 'vehicle_no', {
        type: Sequelize.STRING
      }),
      queryInterface.addColumn('gin_sales', 'lrbl_no', {
        type: Sequelize.STRING
      }),
      queryInterface.addColumn('gin_sales', 'place_of_supply', {
        type: Sequelize.STRING
      }),
      queryInterface.addColumn('gin_sales', 'gst_number', {
        type: Sequelize.STRING
      }),
      queryInterface.addColumn('gin_sales', 'gst_percentage', {
        type: Sequelize.STRING
      }),
      queryInterface.addColumn('gin_sales', 'gross_weight', {
        type: Sequelize.STRING
      }),
      queryInterface.addColumn('gin_sales', 'tare_weight', {
        type: Sequelize.STRING
      }),
      queryInterface.addColumn('gin_sales', 'less_weight', {
        type: Sequelize.STRING
      }),
      queryInterface.addColumn('gin_sales', 'sample', {
        type: Sequelize.STRING
      }),
      queryInterface.addColumn('gin_sales', 'press_no', {
        type: Sequelize.STRING
      }),
      queryInterface.addColumn('gin_sales', 'reel_lot_no', {
        type: Sequelize.STRING
      })
    ])
  },

  async down(queryInterface, Sequelize) {
    return await Promise.all([
      queryInterface.removeColumn('gin_sales', 'qr'),
      queryInterface.removeColumn('gin_sales', 'weight_loss'),
      queryInterface.removeColumn('gin_sales', 'transporter_name'),
      queryInterface.removeColumn('gin_sales', 'vehicle_no'),
      queryInterface.removeColumn('gin_sales', 'lrbl_no'),
      queryInterface.removeColumn('gin_sales', 'place_of_supply'),
      queryInterface.removeColumn('gin_sales', 'gst_number'),
      queryInterface.removeColumn('gin_sales', 'gst_percentage'),
      queryInterface.removeColumn('gin_sales', 'gross_weight'),
      queryInterface.removeColumn('gin_sales', 'tare_weight'),
      queryInterface.removeColumn('gin_sales', 'less_weight'),
      queryInterface.removeColumn('gin_sales', 'sample'),
      queryInterface.removeColumn('gin_sales', 'accept_date'),
      queryInterface.removeColumn('gin_sales', 'press_no'),
      queryInterface.removeColumn('gin_sales', 'reel_lot_no')
    ])
  }
};
