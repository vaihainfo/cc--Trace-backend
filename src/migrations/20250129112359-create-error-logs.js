'use strict';
/** @type {import('sequelize-cli').Migration} */
module.exports = {
  async up(queryInterface, Sequelize) {
    await queryInterface.createTable('error_logs', {
      id: {
        allowNull: false,
        autoIncrement: true,
        primaryKey: true,
        type: Sequelize.INTEGER
      },
      method: {
        type: Sequelize.STRING
      },
      api_url: {
        type: Sequelize.STRING
      },
      response_time: {
        type: Sequelize.STRING
      },
      status_code: {
        type: Sequelize.INTEGER
      },
      error_message: {
        type: Sequelize.TEXT
      },
      request_body: {
        type: Sequelize.JSON
      },
      sql_query: {
        type: Sequelize.TEXT
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
    await queryInterface.dropTable('error_logs');
  }
};