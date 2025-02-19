'use strict';

/** @type {import('sequelize-cli').Migration} */
module.exports = {
  async up(queryInterface, Sequelize) {
    await queryInterface.createTable('spinner_yarn_order_sales', {
      id: {
        allowNull: false,
        autoIncrement: true,
        primaryKey: true,
        type: Sequelize.INTEGER
      },
      spinner_yarn_order_id: {
        type: Sequelize.INTEGER,
        allowNull: false,
        references: {
          model: 'spinner_yarn_orders',
          key: 'id'
        },
        onUpdate: 'CASCADE',
        onDelete: 'CASCADE'
      },
      sale_id: {
        type: Sequelize.INTEGER,
        allowNull: false
      },
      quantity_used: {
        type: Sequelize.INTEGER,
        allowNull: false,
        comment: 'Quantity of yarn used from the order'
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

    // Add indexes for better performance
    await queryInterface.addIndex('spinner_yarn_order_sales', ['spinner_yarn_order_id']);
    await queryInterface.addIndex('spinner_yarn_order_sales', ['sale_id']);
  },

  async down(queryInterface, Sequelize) {
    await queryInterface.dropTable('spinner_yarn_order_sales');
  }
};
