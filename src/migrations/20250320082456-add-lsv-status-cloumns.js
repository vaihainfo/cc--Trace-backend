'use strict';

/** @type {import('sequelize-cli').Migration} */
module.exports = {
  async up (queryInterface, Sequelize) {
    await queryInterface.addColumn('lint_stock_verifieds', 'status_ginner', {
      type: Sequelize.STRING
    });

    await queryInterface.addColumn('lint_stock_verifieds', 'status_spinner', {
      type: Sequelize.STRING
    });
  },

  async down (queryInterface, Sequelize) {
    await queryInterface.removeColumn('lint_stock_verifieds', 'status_ginner');
    await queryInterface.removeColumn('lint_stock_verifieds', 'status_spinner');
  }
};
