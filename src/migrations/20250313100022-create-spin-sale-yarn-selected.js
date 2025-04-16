'use strict';
/** @type {import('sequelize-cli').Migration} */
module.exports = {
  async up(queryInterface, Sequelize) {
    await queryInterface.createTable('spin_sale_yarn_selecteds', {
      id: {
        allowNull: false,
        autoIncrement: true,
        primaryKey: true,
        type: Sequelize.INTEGER
      },
      sales_id: {
        type: Sequelize.INTEGER,
        allowNull: false,
        foreignKey: true,
        references: { model: 'spin_sales', key: 'id' },
        onDelete: 'CASCADE',
      },
      process_id: {
        type: Sequelize.INTEGER,
        allowNull: false,
        foreignKey: true,
        references: { model: 'spin_processes', key: 'id' },
        onDelete: 'CASCADE',
      },
      yarn_id: {
        type: Sequelize.INTEGER,
        allowNull: false,
        foreignKey: true,
        references: { model: 'spin_yarns', key: 'id' },
        onDelete: 'CASCADE',
      },
      batch_lot_no: {
        type: Sequelize.STRING
      },
      box_id: {
        type: Sequelize.STRING
      },
      no_of_boxes: {
        type: Sequelize.DOUBLE
      },
      price: {
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
    await queryInterface.dropTable('spin_sale_yarn_selecteds');
  }
};