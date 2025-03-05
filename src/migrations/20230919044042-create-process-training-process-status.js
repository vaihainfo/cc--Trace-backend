'use strict';
/** @type {import('sequelize-cli').Migration} */
module.exports = {
  async up(queryInterface, Sequelize) {
    await queryInterface.createTable('process_training_process_statuses', {
      id: {
        allowNull: false,
        autoIncrement: true,
        primaryKey: true,
        type: Sequelize.INTEGER
      },
      process_training_id: {
        type: Sequelize.INTEGER
      },
      spinner_id: {
        type: Sequelize.INTEGER
      },
      ginner_id: {
        type: Sequelize.INTEGER
      },
      weaver_id: {
        type: Sequelize.INTEGER
      },
      knitter_id: {
        type: Sequelize.INTEGER
      },
      trader_id: {
        type: Sequelize.INTEGER
      },
      garment_id: {
        type: Sequelize.INTEGER
      },
      status: {
        type: Sequelize.STRING,
      },
      feedback: {
        type: Sequelize.STRING,
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
    await queryInterface.dropTable('process_training_process_statuses');
  }
};