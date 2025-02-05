'use strict';
/** @type {import('sequelize-cli').Migration} */
module.exports = {
  async up(queryInterface, Sequelize) {
    await queryInterface.createTable('gin_to_gin_sales', {
      id: {
        allowNull: false,
        autoIncrement: true,
        primaryKey: true,
        type: Sequelize.INTEGER
      },
      sales_id: {
        allowNull: false,
        type: Sequelize.INTEGER
      },
      process_id: {
        allowNull: false,
        type: Sequelize.INTEGER
      },
      bale_id: {
        allowNull: false,
        type: Sequelize.INTEGER
      },
      bale_weight: {
        type: Sequelize.DOUBLE
      },
      old_ginner_id: {
        type: Sequelize.INTEGER
      },
      new_ginner_id: {
        type: Sequelize.INTEGER
      },
      gin_accepted_status: {
        type: Sequelize.BOOLEAN
      },
      gin_sold_status: {
        type: Sequelize.BOOLEAN
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
    await queryInterface.dropTable('gin_to_gin_sales');
  }
};