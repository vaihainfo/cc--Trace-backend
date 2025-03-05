'use strict';
/** @type {import('sequelize-cli').Migration} */
module.exports = {
  async up(queryInterface, Sequelize) {
    await queryInterface.createTable('washing_sales', {
      id: {
        allowNull: false,
        autoIncrement: true,
        primaryKey: true,
        type: Sequelize.INTEGER
      },
      season_id: {
        type: Sequelize.INTEGER
      },
      washing_id: {
        type: Sequelize.INTEGER
      },
      date: {
        type: Sequelize.DATE
      },
      program_id: {
        type: Sequelize.INTEGER
      },
      order_refernce: {
        type: Sequelize.STRING
      },
      buyer_type: {
        type: Sequelize.ENUM('Printing', 'Compacting', 'Garment', 'New'),
      },
      buyer_id: {
        type: Sequelize.INTEGER
      },
      fabric_id: {
        type: Sequelize.INTEGER
      },
      processor_name: {
        type: Sequelize.STRING
      },
      processor_address: {
        type: Sequelize.STRING
      },
      fabric_quantity: {
        type: Sequelize.DOUBLE
      },
      old_fabric_quantity: {
        type: Sequelize.DOUBLE,
        defaultValue: 0
      },
      add_fabric_quantity: {
        type: Sequelize.DOUBLE
      },
      total_fabric_quantity: {
        type: Sequelize.DOUBLE
      },
      fabric_type: {
        type: Sequelize.STRING
      },
      fabric_length: {
        type: Sequelize.DOUBLE
      },
      gsm: {
        type: Sequelize.STRING
      },
      fabric_net_weight: {
        type: Sequelize.DOUBLE
      },
      batch_lot_no: {
        type: Sequelize.STRING
      },
      job_details: {
        type: Sequelize.STRING
      },
      wash_type: {
        type: Sequelize.STRING
      },
      invoice_no: {
        type: Sequelize.STRING
      },
      order_details: {
        type: Sequelize.STRING
      },
      bill_of_lading: {
        type: Sequelize.STRING
      },
      transport_info: {
        type: Sequelize.STRING
      },
      qty_stock: {
        type: Sequelize.DOUBLE
      },
      status: {
        type: Sequelize.STRING
      },
      washing_details: {
        type: Sequelize.STRING
      },
      weight_gain: {
        type: Sequelize.STRING
      },
      weight_loss: {
        type: Sequelize.STRING
      },
      accept_date: {
        type: Sequelize.DATE
      },
      qr: {
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
    await queryInterface.dropTable('washing_sales');
  }
};