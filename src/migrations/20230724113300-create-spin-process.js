'use strict';
/** @type {import('sequelize-cli').Migration} */
module.exports = {
  async up(queryInterface, Sequelize) {
    await queryInterface.createTable('spin_processes', {
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
      other_mix: {
        type: Sequelize.DOUBLE
      },
      cottonmix_type: {
        type: Sequelize.INTEGER
      },
      cottonmix_qty: {
        type: Sequelize.INTEGER
      },
      yarn_type: {
        allowNull: false,
        type: Sequelize.STRING
      },
      total_qty: {
        allowNull: false,
        type: Sequelize.DOUBLE
      },
      yarn_count: {
        allowNull: false,
        type: Sequelize.DOUBLE
      },
      yarn_qty_produced: {
        allowNull: false,
        type: Sequelize.DOUBLE
      },
      yarn_realisation: {
        allowNull: false,
        type: Sequelize.DOUBLE
      },
      net_yarn_qty: {
        type: Sequelize.DOUBLE
      },
      comber_noil: {
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
      box_id: {
        type: Sequelize.STRING
      },
      process_complete: {
        allowNull: false,
        type: Sequelize.BOOLEAN
      },
      dyeing_required: {
        allowNull: false,
        type: Sequelize.BOOLEAN
      },
      qty_stock: {
        type: Sequelize.DOUBLE
      },
      status: {
        type: Sequelize.STRING
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
    await queryInterface.dropTable('spin_processes');
  }
};