'use strict';
/** @type {import('sequelize-cli').Migration} */
module.exports = {
  async up(queryInterface, Sequelize) {
    await queryInterface.createTable('garment_sales', {
      id: {
        allowNull: false,
        autoIncrement: true,
        primaryKey: true,
        type: Sequelize.INTEGER
      },
      garment_id: {
        type: Sequelize.INTEGER,
        foreignKey: true,
        references: { model: 'garments', key: 'id' },
        onDelete: 'CASCADE',
        allowNull: false,
      },
      season_id: {
        allowNull: false,
        type: Sequelize.INTEGER
      },
      date: {
        allowNull: false,
        type: Sequelize.DATE
      },
      program_id: {
        allowNull: false,
        type: Sequelize.INTEGER
      },
      department_id: {
        allowNull: false,
        type: Sequelize.INTEGER
      },
      order_ref: {
        type: Sequelize.STRING
      },
      buyer_type: {
        allowNull: false,
        type: Sequelize.STRING
      },
      buyer_id: {
        type: Sequelize.INTEGER
      },
      trader_id: {
        type: Sequelize.INTEGER
      },
      processor_name: {
        type: Sequelize.STRING
      },
      processor_address: {
        type: Sequelize.STRING
      },
      fabric_length: {
        type: Sequelize.DOUBLE
      },
      additional_fabric_length: {
        type: Sequelize.DOUBLE
      },
      total_fabric_length: {
        allowNull: false,
        type: Sequelize.DOUBLE
      },
      transaction_via_trader: {
        allowNull: false,
        type: Sequelize.BOOLEAN
      },
      transaction_agent: {
        type: Sequelize.STRING
      },
      garment_type: {
        allowNull: false,
        type: Sequelize.STRING
      },
      style_mark_no: {
        allowNull: false,
        type: Sequelize.STRING
      },
      garment_size: {
        allowNull: false,
        type: Sequelize.STRING
      },
      color: {
        type: Sequelize.STRING
      },
      no_of_pieces: {
        allowNull: false,
        type: Sequelize.INTEGER
      },
      no_of_boxes: {
        type: Sequelize.INTEGER
      },
      invoice_no: {
        allowNull: false,
        type: Sequelize.STRING
      },
      box_ids: {
        type: Sequelize.STRING
      },
      bill_of_ladding: {
        type: Sequelize.STRING
      },
      transport_info: {
        type: Sequelize.STRING
      },
      contract_no: {
        type: Sequelize.STRING
      },
      tc_file: {
        type: Sequelize.STRING
      },
      contract_file: {
        type: Sequelize.STRING
      },
      invoice_file: {
        type: Sequelize.STRING
      },
      delivery_notes: {
        type: Sequelize.STRING
      },
      qty_stock: {
        type: Sequelize.DOUBLE
      },
      embroidering_required: {
        allowNull: false,
        type: Sequelize.BOOLEAN
      },
      embroidering_id: {
        type: Sequelize.INTEGER,
        references: { model: 'embroiderings', key: 'id' },
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
    await queryInterface.dropTable('garment_sales');
  }
};