'use strict';
/** @type {import('sequelize-cli').Migration} */
module.exports = {
  async up(queryInterface, Sequelize) {
    await queryInterface.createTable('garment_processes', {
      id: {
        allowNull: false,
        autoIncrement: true,
        primaryKey: true,
        type: Sequelize.INTEGER
      },
      garment_id: {
        type: Sequelize.INTEGER
      },
      season_id: {
        type: Sequelize.INTEGER
      },
      date: {
        type: Sequelize.DATE
      },
      program_id: {
        type: Sequelize.INTEGER
      },
      department_id: {
        type: Sequelize.INTEGER
      },
      fabric_order_ref: {
        type: Sequelize.STRING
      },
      brand_order_ref: {
        type: Sequelize.STRING
      },
      fabric_weight: {
        type: Sequelize.DOUBLE
      },
      additional_fabric_weight: {
        type: Sequelize.DOUBLE
      },
      total_fabric_weight: {
        type: Sequelize.DOUBLE
      },
      fabric_length: {
        type: Sequelize.DOUBLE
      },
      additional_fabric_length: {
        type: Sequelize.DOUBLE
      },
      total_fabric_length: {
        type: Sequelize.DOUBLE
      },
      factory_lot_no: {
        type: Sequelize.STRING
      },
      reel_lot_no: {
        type: Sequelize.STRING
      },
      total_waste_perct: {
        type: Sequelize.DOUBLE
      },
      waste_weight: {
        type: Sequelize.DOUBLE
      },
      waste_length: {
        type: Sequelize.DOUBLE
      },
      waste_fabric_sold_to: {
        type: Sequelize.STRING
      },
      waste_fabric_invoice: {
        type: Sequelize.STRING
      },
      garment_type: {
        type: Sequelize.ARRAY(Sequelize.STRING)
      },
      style_mark_no: {
        type: Sequelize.ARRAY(Sequelize.STRING)
      },
      garment_size: {
        type: Sequelize.ARRAY(Sequelize.STRING)
      },
      color: {
        type: Sequelize.ARRAY(Sequelize.STRING)
      },
      no_of_pieces: {
        type: Sequelize.ARRAY(Sequelize.DOUBLE)
      },
      no_of_boxes: {
        type: Sequelize.ARRAY(Sequelize.DOUBLE)
      },
      finished_garment_image: {
        type: Sequelize.ARRAY(Sequelize.STRING)
      },
      qr: {
        type: Sequelize.STRING
      },
      status: {
        type: Sequelize.STRING
      },
      qty_stock: {
        type: Sequelize.DOUBLE
      },
      qty_stock_weight: {
        type: Sequelize.DOUBLE
      },
      qty_stock_length: {
        type: Sequelize.DOUBLE
      },
      total_qty: {
        type: Sequelize.DOUBLE
      },
      embroidering_required: {
        type: Sequelize.BOOLEAN
      },
      embroidering_id: {
        type: Sequelize.INTEGER
      },
      physical_traceablity: {
        type: Sequelize.BOOLEAN
      },
      accept_date: {
        type: Sequelize.DATE
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
    await queryInterface.dropTable('garment_processes');
  }
};