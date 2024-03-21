'use strict';
/** @type {import('sequelize-cli').Migration} */
module.exports = {
  async up(queryInterface, Sequelize) {
    await queryInterface.createTable('knit_processes', {
      id: {
        allowNull: false,
        autoIncrement: true,
        primaryKey: true,
        type: Sequelize.INTEGER
      },
      knitter_id: {
        type: Sequelize.INTEGER,
        foreignKey: true,
        references: { model: 'knitters', key: 'id' },
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
      garment_order_ref: {
        type: Sequelize.STRING
      },
      brand_order_ref: {
        type: Sequelize.STRING
      },
      other_mix: {
        type: Sequelize.BOOLEAN
      },
      cottonmix_type: {
        type: Sequelize.ARRAY(Sequelize.INTEGER)
      },
      cottonmix_qty: {
        type: Sequelize.ARRAY(Sequelize.INTEGER)
      },
      yarn_type: {
        allowNull: false,
        type: Sequelize.STRING
      },
      yarn_count: {
        allowNull: false,
        type: Sequelize.DOUBLE
      },
      blend_material: {
        type: Sequelize.STRING
      },
      blend_vendor: {
        type: Sequelize.STRING
      },
      yarn_qty: {
        type: Sequelize.DOUBLE
      },
      additional_yarn_qty: {
        type: Sequelize.DOUBLE
      },
      total_yarn_qty: {
        allowNull: false,
        type: Sequelize.DOUBLE
      },
      fabric_type: {
        type: Sequelize.ARRAY(Sequelize.INTEGER)
      },
      fabric_gsm: {
        type: Sequelize.ARRAY(Sequelize.INTEGER)
      },
      fabric_weight: {
        type: Sequelize.ARRAY(Sequelize.DOUBLE)
      },
      batch_lot_no: {
        allowNull: false,
        type: Sequelize.STRING
      },
      reel_lot_no: {
        type: Sequelize.STRING
      },
      job_details_garment: {
        type: Sequelize.STRING
      },
      no_of_rolls: {
        type: Sequelize.INTEGER
      },
      dyeing_required: {
        allowNull: false,
        type: Sequelize.BOOLEAN
      },
      dyeing_id: {
        type: Sequelize.INTEGER,
        references: { model: 'dyeings', key: 'id' },
      },
      blend_invoice: {
        type: Sequelize.STRING
      },
      blend_document: {
        type: Sequelize.ARRAY(Sequelize.STRING)
      },
      qty_stock: {
        type: Sequelize.DOUBLE
      },
      physical_traceablity: {
        type: Sequelize.BOOLEAN
      },
      qr: {
        type: Sequelize.STRING
      },
      total_fabric_weight: {
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
    await queryInterface.dropTable('knit_processes');
  }
};