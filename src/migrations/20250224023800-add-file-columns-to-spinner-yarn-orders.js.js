// src/migrations/YYYYMMDDHHMMSS-add-file-columns-to-spinner-yarn-orders.js

'use strict';

module.exports = {
  up: async (queryInterface, Sequelize) => {
    await queryInterface.addColumn('spinner_yarn_orders', 'order_document', {
      type: Sequelize.STRING,
      allowNull: true
    });
    await queryInterface.addColumn('spinner_yarn_orders', 'contract_files', {
      type: Sequelize.STRING,
      allowNull: true
    });
    await queryInterface.addColumn('spinner_yarn_orders', 'other_files', {
      type: Sequelize.STRING,
      allowNull: true
    });
  },

  down: async (queryInterface, Sequelize) => {
    await queryInterface.removeColumn('spinner_yarn_orders', 'order_document');
    await queryInterface.removeColumn('spinner_yarn_orders', 'contract_files');
    await queryInterface.removeColumn('spinner_yarn_orders', 'other_files');
  }
};