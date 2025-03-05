'use strict';
/** @type {import('sequelize-cli').Migration} */
module.exports = {
  async up(queryInterface, Sequelize) {
    await queryInterface.createTable('farmer_agri_areas', {
      id: {
        allowNull: false,
        autoIncrement: true,
        primaryKey: true,
        type: Sequelize.INTEGER
      },
      farmer_id: {
        type: Sequelize.INTEGER,
        foreignKey: true,
        references: { model: 'farmers', key: 'id' },
        onDelete: 'CASCADE',
        allowNull: false,
      },
      agri_irrigated: {
        type: Sequelize.DECIMAL
      },
      agri_supportive_irrigation: {
        type: Sequelize.DECIMAL
      },
      agri_rainfed: {
        type: Sequelize.DECIMAL
      },
      agri_under_drip: {
        type: Sequelize.DECIMAL
      },
      agri_total_area: {
        type: Sequelize.DECIMAL
      },
      agri_estimated_yeld: {
        type: Sequelize.DECIMAL
      },
      agri_estimated_prod: {
        type: Sequelize.DECIMAL
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
    await queryInterface.dropTable('farmer_agri_areas');
  }
};