'use strict';
/** @type {import('sequelize-cli').Migration} */
module.exports = {
  async up(queryInterface, Sequelize) {
    await queryInterface.createTable('transactions', {
      id: {
        allowNull: false,
        autoIncrement: true,
        primaryKey: true,
        type: Sequelize.INTEGER
      },
      date: {
        allowNull: false,
        type: Sequelize.DATE
      },
      country_id: {
        type: Sequelize.INTEGER,
        foreignKey: true,
        references: { model: 'countries', key: 'id' },
        onDelete: 'CASCADE',
        allowNull: false,
      },
      state_id: {
        type: Sequelize.INTEGER,
        foreignKey: true,
        references: { model: 'states', key: 'id' },
        onDelete: 'CASCADE',
        allowNull: false,
      },
      district_id: {
        type: Sequelize.INTEGER,
        foreignKey: true,
        references: { model: 'districts', key: 'id' },
        onDelete: 'CASCADE',
        allowNull: false,
      },
      block_id: {
        type: Sequelize.INTEGER,
        foreignKey: true,
        references: { model: 'blocks', key: 'id' },
        onDelete: 'CASCADE',
        allowNull: false,
      },
      village_id: {
        type: Sequelize.INTEGER,
        foreignKey: true,
        references: { model: 'villages', key: 'id' },
        onDelete: 'CASCADE',
      },
      farmer_id: {
        type: Sequelize.INTEGER,
        foreignKey: true,
        references: { model: 'farmers', key: 'id' },
        onDelete: 'CASCADE',
        allowNull: false,
      },
      farmer_name: {
        allowNull: false,
        type: Sequelize.STRING
      },
      brand_id: {
        type: Sequelize.INTEGER,
        foreignKey: true,
        references: { model: 'brands', key: 'id' },
        onDelete: 'CASCADE',
        allowNull: false,
      },
      farmer_code: {
        type: Sequelize.STRING
      },
      season_id: {
        type: Sequelize.INTEGER,
        foreignKey: true,
        references: { model: 'seasons', key: 'id' },
        onDelete: 'CASCADE',
        allowNull: false,
      },
      qty_purchased: {
        allowNull: false,
        type: Sequelize.STRING
      },
      rate: {
        allowNull: false,
        type: Sequelize.STRING
      },
      grade_id: {
        type: Sequelize.INTEGER,
        foreignKey: true,
        references: { model: 'crop_grades', key: 'id' },
        onDelete: 'CASCADE',
        allowNull: false,
      },
      program_id: {
        type: Sequelize.INTEGER,
        foreignKey: true,
        references: { model: 'programs', key: 'id' },
        onDelete: 'CASCADE',
        allowNull: false,
      },
      total_amount: {
        type: Sequelize.STRING
      },
      mapped_ginner: {
        allowNull: false,
        type: Sequelize.INTEGER
      },
      vehicle: {
        type: Sequelize.STRING
      },
      payment_method: {
        type: Sequelize.STRING
      },
      proof: {
        type: Sequelize.STRING
      },
      status: {
        allowNull: false,
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
    await queryInterface.dropTable('transactions');
  }
};