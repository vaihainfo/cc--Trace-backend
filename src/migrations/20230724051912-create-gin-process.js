'use strict';
/** @type {import('sequelize-cli').Migration} */
module.exports = {
  async up(queryInterface, Sequelize) {
    await queryInterface.createTable('gin_process', {
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
      gin_out_turn: {
        type: Sequelize.DOUBLE
      },
      lot_no: {
        allowNull: false,
        type: Sequelize.STRING
      },
      reel_lot_no: {
        type: Sequelize.STRING
      },
      press_no: {
        type: Sequelize.STRING
      },
      weight: {
        type: Sequelize.STRING
      },
      staple: {
        type: Sequelize.STRING
      },
      mic: {
        type: Sequelize.STRING
      },
      strength: {
        type: Sequelize.STRING
      },
      trash: {
        type: Sequelize.STRING
      },
      color_grade: {
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
    await queryInterface.dropTable('gin_process');
  }
};