'use strict';
/** @type {import('sequelize-cli').Migration} */
module.exports = {
  async up(queryInterface, Sequelize) {
    await queryInterface.createTable('spin_sales', {
      id: {
        allowNull: false,
        autoIncrement: true,
        primaryKey: true,
        type: Sequelize.INTEGER
      },
      spinner_id: {
        type: Sequelize.INTEGER,
        foreignKey: true,
        references: { model: 'spinners', key: 'id' },
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
      processor_name: {
        type: Sequelize.STRING
      },
      processor_address: {
        type: Sequelize.STRING
      },
      trader_id: {
        type: Sequelize.INTEGER
      },
      transaction_via_trader: {
        allowNull: false,
        type: Sequelize.BOOLEAN
      },
      transaction_agent: {
        type: Sequelize.STRING
      },
      total_qty: {
        type: Sequelize.DOUBLE
      },
      no_of_boxes: {
        type: Sequelize.INTEGER
      },
      batch_lot_no: {
        allowNull: false,
        type: Sequelize.STRING
      },
      reel_lot_no: {
        type: Sequelize.STRING
      },
      box_ids: {
        type: Sequelize.STRING
      },
      yarn_type: {
        type: Sequelize.STRING
      },
      yarn_count: {
        type: Sequelize.DOUBLE
      },
      invoice_no: {
        allowNull: false,
        type: Sequelize.STRING
      },
      bill_of_ladding: {
        allowNull: false,
        type: Sequelize.STRING
      },
      transporter_name: {
        allowNull: false,
        type: Sequelize.STRING
      },
      vehicle_no: {
        allowNull: false,
        type: Sequelize.STRING
      },
      quality_doc: {
        type: Sequelize.STRING
      },
      tc_files: {
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
    await queryInterface.dropTable('spin_sales');
  }
};