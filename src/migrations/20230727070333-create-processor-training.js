'use strict';
/** @type {import('sequelize-cli').Migration} */
module.exports = {
  async up(queryInterface, Sequelize) {
    await queryInterface.createTable('processor_trainings', {
      id: {
        allowNull: false,
        autoIncrement: true,
        primaryKey: true,
        type: Sequelize.INTEGER
      },
      training_type: {
        allowNull: false,
        type: Sequelize.STRING
      },
      brand_id: {
        allowNull: false,
        type: Sequelize.INTEGER
      },
      country_id: {
        allowNull: false,
        type: Sequelize.INTEGER
      },
      state_id: {
        allowNull: false,
        type: Sequelize.STRING
      },
      processor: {
        allowNull: false,
        type: Sequelize.STRING
      },
      training_mode: {
        allowNull: false,
        type: Sequelize.STRING
      },
      processor_name: {
        type: Sequelize.STRING
      },
      training_description: {
        type: Sequelize.TEXT
      },
      venue: {
        allowNull: false,
        type: Sequelize.TEXT
      },
      date: {
        allowNull: false,
        type: Sequelize.DATE
      },
      start_time: {
        allowNull: false,
        type: Sequelize.TIME
      },
      end_time: {
        type: Sequelize.TIME
      },
      feedback: {
        type: Sequelize.TEXT
      },
      status: {
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
    await queryInterface.dropTable('processor_trainings');
  }
};