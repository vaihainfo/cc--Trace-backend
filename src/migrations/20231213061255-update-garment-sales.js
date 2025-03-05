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
    await queryInterface.removeColumn('garment_sales', 'department_id');
    await queryInterface.removeColumn('garment_sales', 'order_ref');
    await queryInterface.removeColumn('garment_sales', 'additional_fabric_length');
    await queryInterface.removeColumn('garment_sales', 'garment_type');
    await queryInterface.removeColumn('garment_sales', 'style_mark_no');
    await queryInterface.removeColumn('garment_sales', 'garment_size');
    await queryInterface.removeColumn('garment_sales', 'color');
    await queryInterface.removeColumn('garment_sales', 'no_of_pieces');
    await queryInterface.removeColumn('garment_sales', 'no_of_boxes');
    await queryInterface.removeColumn('garment_sales', 'box_ids');
    await queryInterface.removeColumn('garment_sales', 'transport_info');
    await queryInterface.removeColumn('garment_sales', 'invoice_file');
    await queryInterface.removeColumn('garment_sales', 'embroidering_required');
    await queryInterface.removeColumn('garment_sales', 'embroidering_id');

    await queryInterface.addColumn('garment_sales', 'department_id', {
      type: Sequelize.ARRAY(Sequelize.INTEGER)
    });

    await queryInterface.addColumn('garment_sales', 'fabric_order_ref', {
      type: Sequelize.STRING
    });

    await queryInterface.addColumn('garment_sales', 'brand_order_ref', {
      type: Sequelize.STRING
    });
    await queryInterface.addColumn('garment_sales', 'total_no_of_pieces', {
      type: Sequelize.DOUBLE
    });
    await queryInterface.addColumn('garment_sales', 'total_no_of_boxes', {
      type: Sequelize.DOUBLE
    });
    await queryInterface.addColumn('garment_sales', 'fabric_weight', {
      type: Sequelize.DOUBLE
    });
    await queryInterface.addColumn('garment_sales', 'total_fabric_weight', {
      type: Sequelize.DOUBLE
    });
    await queryInterface.addColumn('garment_sales', 'style_mark_no', {
      type: Sequelize.ARRAY(Sequelize.STRING)
    });
    await queryInterface.addColumn('garment_sales', 'garment_type', {
      type: Sequelize.ARRAY(Sequelize.STRING)
    });
    await queryInterface.addColumn('garment_sales', 'invoice_files', {
      type: Sequelize.ARRAY(Sequelize.STRING)
    });
    await queryInterface.addColumn('garment_sales', 'transportor_name', {
      type: Sequelize.STRING
    });
    await queryInterface.addColumn('garment_sales', 'shipment_address', {
      type: Sequelize.STRING
    });
    await queryInterface.addColumn('garment_sales', 'vehicle_no', {
      type: Sequelize.STRING
    });
    await queryInterface.addColumn('garment_sales', 'qty_stock_pieces', {
      type: Sequelize.DOUBLE
    });
    await queryInterface.addColumn('garment_sales', 'qty_stock_boxes', {
      type: Sequelize.DOUBLE
    });
    await queryInterface.addColumn('garment_sales', 'qty_stock_length', {
      type: Sequelize.DOUBLE
    });
    await queryInterface.addColumn('garment_sales', 'qty_stock_weight', {
      type: Sequelize.DOUBLE
    });

  },

  async down (queryInterface, Sequelize) {
    /**
     * Add reverting commands here.
     *
     * Example:
     * await queryInterface.dropTable('users');
     */
    await queryInterface.removeColumn('garment_sales', 'department_id');
    await queryInterface.removeColumn('garment_sales', 'fabric_order_ref');
    await queryInterface.removeColumn('garment_sales', 'brand_order_ref');
    await queryInterface.removeColumn('garment_sales', 'total_no_of_pieces');
    await queryInterface.removeColumn('garment_sales', 'total_no_of_boxes');
    await queryInterface.removeColumn('garment_sales', 'fabric_weight');
    await queryInterface.removeColumn('garment_sales', 'total_fabric_weight');
    await queryInterface.removeColumn('garment_sales', 'style_mark_no');
    await queryInterface.removeColumn('garment_sales', 'garment_type');
    await queryInterface.removeColumn('garment_sales', 'invoice_files');
    await queryInterface.removeColumn('garment_sales', 'transportor_name');
    await queryInterface.removeColumn('garment_sales', 'shipment_address');
    await queryInterface.removeColumn('garment_sales', 'vehicle_no');
    await queryInterface.removeColumn('garment_sales', 'qty_stock_pieces');
    await queryInterface.removeColumn('garment_sales', 'qty_stock_boxes');
    await queryInterface.removeColumn('garment_sales', 'qty_stock_length');
    await queryInterface.removeColumn('garment_sales', 'qty_stock_weight');

    await queryInterface.addColumn('garment_sales', 'department_id', {
      type: Sequelize.INTEGER
    });
    await queryInterface.addColumn('garment_sales', 'order_ref', {
      type: Sequelize.STRING
    });
    await queryInterface.addColumn('garment_sales', 'additional_fabric_length', {
      type: Sequelize.DOUBLE
    });
    await queryInterface.addColumn('garment_sales', 'garment_type', {
      type: Sequelize.STRING
    });
    await queryInterface.addColumn('garment_sales', 'style_mark_no', {
      type: Sequelize.STRING
    });
    await queryInterface.addColumn('garment_sales', 'garment_size', {
      type: Sequelize.STRING
    });
    await queryInterface.addColumn('garment_sales', 'color', {
      type: Sequelize.STRING
    });
    await queryInterface.addColumn('garment_sales', 'no_of_pieces', {
      type: Sequelize.INTEGER
    });
    await queryInterface.addColumn('garment_sales', 'no_of_boxes', {
      type: Sequelize.INTEGER
    });
    await queryInterface.addColumn('garment_sales', 'box_ids', {
      type: Sequelize.STRING
    });
    await queryInterface.addColumn('garment_sales', 'transport_info', {
      type: Sequelize.STRING
    });
    await queryInterface.addColumn('garment_sales', 'invoice_file', {
      type: Sequelize.STRING
    });
    await queryInterface.addColumn('garment_sales', 'embroidering_required', {
      type: Sequelize.BOOLEAN
    });
    await queryInterface.addColumn('garment_sales', 'embroidering_id', {
      type: Sequelize.INTEGER
    });
  }
};
