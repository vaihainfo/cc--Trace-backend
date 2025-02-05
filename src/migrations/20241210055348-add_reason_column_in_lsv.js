'use strict';

/** @type {import('sequelize-cli').Migration} */
module.exports = {
  async up (queryInterface, Sequelize) {
    await queryInterface.addColumn('lint_stock_verifieds', 'reason_ginner', {
      type: Sequelize.STRING
    });
    await queryInterface.addColumn('lint_stock_verifieds', 'reason_scm', {
      type: Sequelize.STRING
    });
    await queryInterface.addColumn('lint_stock_verifieds', 'reason_scd', {
      type: Sequelize.STRING
    });
    await queryInterface.addColumn('lint_stock_verifieds', 'reason_spinner', {
      type: Sequelize.STRING
    });
    await queryInterface.addColumn('lint_stock_verifieds', 'reason_bm', {
      type: Sequelize.STRING
    });
    await queryInterface.addColumn('lint_stock_verifieds', 'reason_ps', {
      type: Sequelize.STRING
    });
  },

  async down (queryInterface, Sequelize) {
    await queryInterface.removeColumn('lint_stock_verifieds', 'reason_ginner');
    await queryInterface.removeColumn('lint_stock_verifieds', 'reason_scm');
    await queryInterface.removeColumn('lint_stock_verifieds', 'reason_scd');
    await queryInterface.removeColumn('lint_stock_verifieds', 'reason_spinner');
    await queryInterface.removeColumn('lint_stock_verifieds', 'reason_bm');
    await queryInterface.removeColumn('lint_stock_verifieds', 'reason_ps');
  }
};
