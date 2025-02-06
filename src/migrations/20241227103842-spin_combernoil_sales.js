'use strict';

/** @type {import('sequelize-cli').Migration} */
module.exports = {
  async up(queryInterface, Sequelize) {
    await queryInterface.createTable('spin_combernoil_sales', {
      id: {
        allowNull: false,
        autoIncrement: true,
        primaryKey: true,
        type: Sequelize.INTEGER
      },
      season_id: {
        type: Sequelize.INTEGER,
        allowNull: false
      },
      spinner_id: {
        type: Sequelize.INTEGER,
        allowNull: false
      },
      comber_ids: {
        type: Sequelize.ARRAY(Sequelize.INTEGER),
        allowNull: true
      },
      sale_type: {
        type: Sequelize.STRING,
        allowNull: true
      },
      date: {
        type: Sequelize.DATE,
        allowNull: false
      },
      program_id: {
        type: Sequelize.INTEGER,
        allowNull: true
      },
      order_ref: {
        type: Sequelize.STRING,
        allowNull: true
      },
      buyer_type: {
        type: Sequelize.STRING,
        allowNull: true
      },
      buyer_id: {
        type: Sequelize.INTEGER,
        allowNull: false
      },
      processor_name: {
        type: Sequelize.STRING,
        allowNull: true
      },
      processor_address: {
        type: Sequelize.TEXT,
        allowNull: true
      },
      trader_id: {
        type: Sequelize.INTEGER,
        allowNull: true
      },
      transaction_via_trader: {
        type: Sequelize.BOOLEAN,
        defaultValue: false
      },
      transaction_agent: {
        type: Sequelize.STRING,
        allowNull: true
      },
      total_qty: {
        type: Sequelize.DOUBLE,
        allowNull: true
      },
      batch_lot_no: {
        type: Sequelize.STRING,
        allowNull: true
      },
      reel_lot_no: {
        type: Sequelize.STRING,
        allowNull: true
      },
      invoice_no: {
        type: Sequelize.STRING,
        allowNull: true
      },
      bill_of_ladding: {
        type: Sequelize.STRING,
        allowNull: true
      },
      transporter_name: {
        type: Sequelize.STRING,
        allowNull: true
      },
      vehicle_no: {
        type: Sequelize.STRING,
        allowNull: true
      },
      quality_doc: {
        type: Sequelize.STRING,
        allowNull: true
      },
      tc_files: {
        type: Sequelize.STRING,
        allowNull: true
      },
      contract_file: {
        type: Sequelize.STRING,
        allowNull: true
      },
      invoice_file: {
        type: Sequelize.ARRAY(Sequelize.TEXT)
      },
      delivery_notes: {
        type: Sequelize.TEXT,
        allowNull: true
      },
      qty_stock: {
        type: Sequelize.DOUBLE,
        allowNull: false,
        defaultValue: 0
      },
      status: {
        type: Sequelize.STRING,
        allowNull: false,
        defaultValue: 'pending'
      },
      qr: {
        type: Sequelize.STRING,
        allowNull: true
      },
      accept_date: {
        type: Sequelize.DATE,
        allowNull: true
      },
      price: {
        type: Sequelize.DOUBLE,
        allowNull: true
      },
      submitted_by: {
        type: Sequelize.INTEGER,
        allowNull: true
      },
      accept_by: {
        type: Sequelize.INTEGER,
        allowNull: true
      },
      letter_of_credit: {
        type: Sequelize.ARRAY(Sequelize.TEXT)
      },
      logistics_documents: {
        type: Sequelize.ARRAY(Sequelize.TEXT)
      },
      yarn_quality_test_reports: {
        type: Sequelize.ARRAY(Sequelize.TEXT)
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
    await queryInterface.dropTable('spin_combernoil_sales');
  }
};