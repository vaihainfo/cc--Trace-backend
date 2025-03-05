'use strict';
/** @type {import('sequelize-cli').Migration} */
module.exports = {
  async up(queryInterface, Sequelize) {
    await queryInterface.createTable('gin_sales', {
      id: {
        allowNull: false,
        autoIncrement: true,
        primaryKey: true,
        type: Sequelize.INTEGER
      },
      ginner_id: {
        type: Sequelize.INTEGER,
        foreignKey: true,
        references: { model: 'ginners', key: 'id' },
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
      total_qty: {
        type: Sequelize.DOUBLE
      },
      no_of_bales: {
        type: Sequelize.INTEGER
      },
      choosen_bale: {
        type: Sequelize.STRING
      },
      lot_no: {
        type: Sequelize.STRING
      },
      buyer: {
        allowNull: false,
        type: Sequelize.INTEGER
      },
      shipping_address: {
        allowNull: false,
        type: Sequelize.STRING
      },
      transaction_via_trader: {
        allowNull: false,
        type: Sequelize.BOOLEAN
      },
      transaction_agent: {
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
      candy_rate: {
        allowNull: false,
        type: Sequelize.STRING
      },
      rate: {
        allowNull: false,
        type: Sequelize.STRING
      },
      sale_value: {
        type: Sequelize.STRING
      },
      invoice_no: {
        type: Sequelize.STRING
      },
      despatch_from: {
        allowNull: false,
        type: Sequelize.STRING
      },
      despatch_to: {
        type: Sequelize.STRING
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
    await queryInterface.dropTable('gin_sales');
  }
};