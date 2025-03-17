'use strict';

module.exports = {
  up: async (queryInterface, Sequelize) => {
    await queryInterface.createTable('spinner_place_lint_orders_sales', {
      id: {
        type: Sequelize.INTEGER,
        autoIncrement: true,
        allowNull: false,
        primaryKey: true
      },
      spinner_place_lint_order_id: {
        type: Sequelize.INTEGER,
        allowNull: false,
        references: {
          model: 'spinner_place_lint_orders',
          key: 'id'
        },
        onUpdate: 'CASCADE',
        onDelete: 'CASCADE'
      },
      ginner_sale_id: {
        type: Sequelize.INTEGER,
        allowNull: false,
        references: {
          model: 'gin_sales',
          key: 'id'
        },
        onUpdate: 'CASCADE',
        onDelete: 'CASCADE'
      },
      quantity_used: {
        type: Sequelize.INTEGER,
        allowNull: false,
        comment: 'Quantity of lint used from the order'
      },
      created_at: {
        type: Sequelize.DATE,
        allowNull: false,
        defaultValue: Sequelize.literal('CURRENT_TIMESTAMP')
      },
      updated_at: {
        type: Sequelize.DATE,
        allowNull: false,
        defaultValue: Sequelize.literal('CURRENT_TIMESTAMP')
      }
    });

    // Add index for better query performance
    await queryInterface.addIndex('spinner_place_lint_orders_sales', ['spinner_place_lint_order_id']);
    await queryInterface.addIndex('spinner_place_lint_orders_sales', ['ginner_sale_id']);
  },

  down: async (queryInterface, Sequelize) => {
    await queryInterface.dropTable('spinner_place_lint_orders_sales');
  }
};