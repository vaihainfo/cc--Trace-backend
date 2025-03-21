'use strict';

/** @type {import('sequelize-cli').Migration} */
module.exports = {
  async up(queryInterface, Sequelize) {
    await queryInterface.createTable('ginner_lint_certificates', {
      id: {
        allowNull: false,
        autoIncrement: true,
        primaryKey: true,
        type: Sequelize.INTEGER
      },
      country_id: {
        allowNull: false,
        type: Sequelize.INTEGER
      },
      state_id: {
        allowNull: false,
        type: Sequelize.INTEGER
      },
      brand_id: {
        allowNull: false,
        type: Sequelize.INTEGER
      }, 
      season_id: {
        allowNull: false,
        type: Sequelize.INTEGER
      },
      program_id: {
        allowNull: false,
        type: Sequelize.INTEGER
      },
      ginner_id: {
        allowNull: false,
        type: Sequelize.INTEGER
      },
      document: {
        type: Sequelize.ARRAY(Sequelize.TEXT),
        allowNull: false, 
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
    await queryInterface.dropTable('ginner_lint_certificates');
  }
};
