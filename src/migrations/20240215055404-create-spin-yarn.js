'use strict';
/** @type {import('sequelize-cli').Migration} */
module.exports = {
  async up(queryInterface, Sequelize) {
    await queryInterface.createTable('spin_yarns', {
      id: {
        allowNull: false,
        autoIncrement: true,
        primaryKey: true,
        type: Sequelize.INTEGER
      },
      process_id: {
        type: Sequelize.INTEGER
      },
      yarn_count: {
        type: Sequelize.INTEGER
      },
      yarn_produced: {
        type: Sequelize.DOUBLE
      },
      sold_status: {
        type: Sequelize.BOOLEAN
      },
      qr: {
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
    await queryInterface.dropTable('spin_yarns');
  }
};