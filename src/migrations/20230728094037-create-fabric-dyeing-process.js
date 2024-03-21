'use strict';
/** @type {import('sequelize-cli').Migration} */
module.exports = {
  async up(queryInterface, Sequelize) {
    await queryInterface.createTable('fabric_dyeing_processes', {
      id: {
        allowNull: false,
        autoIncrement: true,
        primaryKey: true,
        type: Sequelize.INTEGER
      },
      fabric_id: {
        allowNull: false,
        foreignKey: true,
        type: Sequelize.INTEGER,
        references: { model: 'fabrics', key: 'id' },
        onDelete: 'CASCADE',
      },
      season_id: {
        allowNull: false,
        type: Sequelize.INTEGER
      },
      date: {
        allowNull: false,
        type: Sequelize.DATE
      },
      program: {
        allowNull: false,
        type: Sequelize.STRING
      },
      order_ref: {
        type: Sequelize.STRING
      },
      choosen_buyer: {
        allowNull: false,
        type: Sequelize.STRING
      },
      buyer_name: {
        type: Sequelize.STRING
      },
      processor_name: {
        type: Sequelize.STRING
      },
      processor_address: {
        type: Sequelize.STRING
      },
      qty_kgs: {
        allowNull: false,
        type: Sequelize.DOUBLE
      },
      qty_woven_fabric: {
        allowNull: false,
        type: Sequelize.DOUBLE
      },
      process_weight: {
        allowNull: false,
        type: Sequelize.STRING
      },
      weight_gain_percent: {
        type: Sequelize.INTEGER
      },
      weight_loss_percent: {
        type: Sequelize.INTEGER
      },
      dying_details: {
        allowNull: false,
        type: Sequelize.STRING
      },
      dying_color: {
        type: Sequelize.STRING
      },
      dyed_fabric_length: {
        allowNull: false,
        type: Sequelize.STRING
      },
      dyed_fabric_gsm: {
        allowNull: false,
        type: Sequelize.STRING
      },
      dyed_fabric_net_weight: {
        type: Sequelize.STRING
      },
      batch_lot_no: {
        allowNull: false,
        type: Sequelize.STRING
      },
      job_details_garment: {
        type: Sequelize.STRING
      },
      invoice_no: {
        type: Sequelize.STRING
      },
      order_details: {
        type: Sequelize.STRING
      },
      bill_of_ladding: {
        type: Sequelize.STRING
      },
      transport_info: {
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
    await queryInterface.dropTable('fabric_dyeing_processes');
  }
};