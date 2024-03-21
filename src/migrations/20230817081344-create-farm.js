'use strict';
/** @type {import('sequelize-cli').Migration} */
module.exports = {
  async up(queryInterface, Sequelize) {
    await queryInterface.createTable('farms', {
      id: {
        type: Sequelize.INTEGER,
        autoIncrement: true,
        allowNull: false,
        primaryKey: true
      },
      farmer_id: {
        type: Sequelize.INTEGER,
        foreignKey: true,
        references: { model: 'farmers', key: 'id' },
        onDelete: 'CASCADE',
        allowNull: false,
      },
      season_id: {
        type: Sequelize.INTEGER,
        allowNull: false,
        foreignKey: true,
        references: { model: 'seasons', key: 'id' },
        onDelete: 'CASCADE'
      },
      program_id: {
        allowNull: false,
        foreignKey: true,
        references: { model: 'programs', key: 'id' },
        onDelete: 'CASCADE',
        type: Sequelize.INTEGER
      },
      agri_id: {
        allowNull: false,
        foreignKey: true,
        references: { model: 'farmer_agri_areas', key: 'id' },
        onDelete: 'CASCADE',
        type: Sequelize.INTEGER
      },
      cotton_id: {
        allowNull: false,
        foreignKey: true,
        references: { model: 'farmer_cotton_areas', key: 'id' },
        onDelete: 'CASCADE',
        type: Sequelize.INTEGER
      },
      agri_total_area: {
        allowNull: false,
        type: Sequelize.STRING
      },
      cotton_total_area: {
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
    await queryInterface.dropTable('farms');
  }
};