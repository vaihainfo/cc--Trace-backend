'use strict';
/** @type {import('sequelize-cli').Migration} */
module.exports = {
  async up(queryInterface, Sequelize) {
    await queryInterface.createTable('weaver_sales', {
      id: {
        allowNull: false,
        autoIncrement: true,
        primaryKey: true,
        type: Sequelize.INTEGER
      },
      weaver_id: {
        type: Sequelize.INTEGER,
        foreignKey: true,
        references: { model: 'weavers', key: 'id' },
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
      transaction_via_trader: {
        allowNull: false,
        type: Sequelize.BOOLEAN
      },
      transaction_agent: {
        type: Sequelize.STRING
      },
      warn_yarn_qty: {
        type: Sequelize.DOUBLE
      },
      weft_choosen: {
        allowNull: false,
        type: Sequelize.STRING
      },
      weft_cottonmix_type: {
        type: Sequelize.STRING
      },
      weft_cottonmix_qty: {
        type: Sequelize.STRING
      },
      weft_yarn_qty: {
        type: Sequelize.DOUBLE
      },
      total_yarn_qty: {
        type: Sequelize.DOUBLE
      },
      fabric_type: {
        allowNull: false,
        type: Sequelize.INTEGER
      },
      fabric_contruction: {
        allowNull: false,
        type: Sequelize.STRING
      },
      fabric_length: {
        allowNull: false,
        type: Sequelize.DOUBLE
      },
      fabric_gsm: {
        allowNull: false,
        type: Sequelize.STRING
      },
      fabric_weight: {
        type: Sequelize.DOUBLE
      },
      batch_lot_no: {
        allowNull: false,
        type: Sequelize.STRING
      },
      job_details_garment: {
        type: Sequelize.STRING
      },
      bale_ids: {
        type: Sequelize.STRING
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
      status: {
        type: Sequelize.STRING
      },
      dyeing_required: {
        allowNull: false,
        type: Sequelize.BOOLEAN
      },
      dyeing_id: {
        type: Sequelize.INTEGER,
        references: { model: 'dyeings', key: 'id' },
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
    await queryInterface.dropTable('weaver_sales');
  }
};