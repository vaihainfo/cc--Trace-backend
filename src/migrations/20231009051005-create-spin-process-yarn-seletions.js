'use strict';
/** @type {import('sequelize-cli').Migration} */
module.exports = {
  async up(queryInterface, Sequelize) {
    await queryInterface.createTable('spin_process_yarn_selections', {
      id: {
        allowNull: false,
        autoIncrement: true,
        primaryKey: true,
        type: Sequelize.INTEGER
      },
      spin_process_id: {
        type: Sequelize.INTEGER
      },
      sales_id: {
        type: Sequelize.INTEGER
      },
      no_of_box: {
        type: Sequelize.DOUBLE
      },
      qty_used: {
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
    await queryInterface.dropTable('spin_process_yarn_selections');
  }
};