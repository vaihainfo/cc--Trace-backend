'use strict';
/** @type {import('sequelize-cli').Migration} */
module.exports = {
  async up(queryInterface, Sequelize) {
    await queryInterface.createTable('village_impacts', {
      id: {
        allowNull: false,
        autoIncrement: true,
        primaryKey: true,
        type: Sequelize.INTEGER
      },
      village: {
        allowNull: false,
        type: Sequelize.STRING
      },
      reduced_chemical_pesticide: {
        type: Sequelize.FLOAT
      },
      reduced_chemical_fertilizer: {
        type: Sequelize.FLOAT
      },
      reduced_water_use: {
        type: Sequelize.FLOAT
      },
      increased_yield: {
        type: Sequelize.FLOAT
      },
      reduced_input_costs: {
        type: Sequelize.FLOAT
      },
      increased_profit: {
        type: Sequelize.FLOAT
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
    await queryInterface.dropTable('village_impacts');
  }
};