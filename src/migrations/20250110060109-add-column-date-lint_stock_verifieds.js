'use strict';

/** @type {import('sequelize-cli').Migration} */
module.exports = {
  async up (queryInterface, Sequelize) {
    await queryInterface.addColumn('lint_stock_verifieds', 'date_initiated_te', {
      type: Sequelize.DATE,
      allowNull: true, // or false if the column is required
      
    });

    await queryInterface.addColumn('lint_stock_verifieds', 'date_initiated_be', {
      type: Sequelize.DATE,
      allowNull: true, // or false if the column is required
      
    });
  },

  async down (queryInterface, Sequelize) {
    await queryInterface.removeColumn('lint_stock_verifieds', 'date_initiated_te');
    await queryInterface.removeColumn('lint_stock_verifieds', 'date_initiated_be');
  }
};
