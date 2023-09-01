'use strict';
/** @type {import('sequelize-cli').Migration} */
module.exports = {
  async up(queryInterface, Sequelize) {
    await queryInterface.createTable('farm_products', {
      id: {
        allowNull: false,
        autoIncrement: true,
        primaryKey: true,
        type: Sequelize.INTEGER
      },
      farmItem_id: {
        type: Sequelize.INTEGER,
        foreignKey: true,
        references: { model: 'farm_items', key: 'id' },
        onDelete: 'CASCADE',
      },
      farmProduct: {
        allowNull: false,
        type: Sequelize.STRING
      },
      farmProduct_status: {
        allowNull: false,
        defaultValue: true,
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
    await queryInterface.dropTable('farm_products');
  }
};