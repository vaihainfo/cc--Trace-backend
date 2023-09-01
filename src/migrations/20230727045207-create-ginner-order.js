'use strict';
/** @type {import('sequelize-cli').Migration} */
module.exports = {
  async up(queryInterface, Sequelize) {
    await queryInterface.createTable('ginner_orders', {
      id: {
        allowNull: false,
        autoIncrement: true,
        primaryKey: true,
        type: Sequelize.INTEGER
      },
      season_id: {
        type: Sequelize.INTEGER
      },
      upload_date: {
        type: Sequelize.DATE
      },
      ginner_id: {
        type: Sequelize.INTEGER,
        references: { model: 'ginners', key: 'id' },
        onDelete: 'CASCADE',
      },
      ginning_mill: {
        type: Sequelize.STRING
      },
      brand_id: {
        type: Sequelize.INTEGER
      },
      program_id: {
        type: Sequelize.INTEGER
      },
      confirmed_bales: {
        type: Sequelize.STRING
      },
      confirmed_lint_order: {
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
    await queryInterface.dropTable('ginner_orders');
  }
};