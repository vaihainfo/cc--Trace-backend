'use strict';
/** @type {import('sequelize-cli').Migration} */
module.exports = {
  async up(queryInterface, Sequelize) {
    await queryInterface.createTable('farmer_cotton_areas', {
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
      cotton_irrigated: {
        type: Sequelize.DECIMAL
      },
      cotton_supportive_irrigation: {
        type: Sequelize.DECIMAL
      },
      cotton_rainfed: {
        type: Sequelize.DECIMAL
      },
      cotton_under_drip: {
        type: Sequelize.DECIMAL
      },
      cotton_total_area: {
        type: Sequelize.DECIMAL
      },
      total_estimated_cotton: {
        type: Sequelize.DECIMAL
      },
      last_year_cotton_area: {
        type: Sequelize.DECIMAL
      },
      last_year_cotton_price: {
        type: Sequelize.DECIMAL
      },
      last_year_yield: {
        type: Sequelize.DECIMAL
      },
      cotton_estimated_area: {
        type: Sequelize.DECIMAL
      },
      cotton_transacted: {
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
    await queryInterface.dropTable('farmer_cotton_areas');
  }
};