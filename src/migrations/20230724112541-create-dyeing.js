'use strict';
/** @type {import('sequelize-cli').Migration} */
module.exports = {
  async up(queryInterface, Sequelize) {
    await queryInterface.createTable('dyeings', {
      id: {
        allowNull: false,
        autoIncrement: true,
        primaryKey: true,
        type: Sequelize.INTEGER
      },
      processor_name: {
        allowNull: false,
        type: Sequelize.STRING
      },
      dyeing_address: {
        allowNull: false,
        type: Sequelize.STRING
      },
      process_name: {
        allowNull: false,
        type: Sequelize.STRING
      },
      yarn_delivered: {
        type: Sequelize.DOUBLE
      },
      process_loss: {
        allowNull: false,
        type: Sequelize.DOUBLE
      },
      net_yarn: {
        type: Sequelize.DOUBLE
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
    await queryInterface.dropTable('dyeings');
  }
};