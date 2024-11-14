'use strict';
/** @type {import('sequelize-cli').Migration} */
module.exports = {
  async up(queryInterface, Sequelize) {
    await queryInterface.createTable('seed-cotton-pricings', {
      id: {
        allowNull: false,
        autoIncrement: true,
        primaryKey: true,
        type: Sequelize.INTEGER
      },
      startDate: {
        type: Sequelize.DATE,
        allowNull: false
      },
      endDate: {
        type: Sequelize.DATE,
        allowNull: false
      },
      program_id: {
        type: Sequelize.INTEGER,
        allowNull: false
      },
      brand_id: {
        type: Sequelize.INTEGER,
        allowNull: false
      },
      season_id: {
        type: Sequelize.INTEGER,
        allowNull: false
      },
      country_id: {
        type: Sequelize.INTEGER,
        allowNull: false
      },
      state_id: {
        type: Sequelize.INTEGER,
        allowNull: false
      },
      district_id: {
        type: Sequelize.INTEGER,
        allowNull: false
      },
      market_price: {
        type: Sequelize.DECIMAL,
        allowNull: false
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
    await queryInterface.dropTable('seed-cotton-pricings');
  }
};