'use strict';

/** @type {import('sequelize-cli').Migration} */
module.exports = {
  async up (queryInterface, Sequelize) {
    await queryInterface.addColumn('lint_stock_verifieds', 'te_id', {
      type: Sequelize.INTEGER
    });

    await queryInterface.addColumn('lint_stock_verifieds', 'scm_id', {
      type: Sequelize.INTEGER
    });

    await queryInterface.addColumn('lint_stock_verifieds', 'scd_id', {
      type: Sequelize.INTEGER
    });

  },

  async down (queryInterface, Sequelize) {
    await queryInterface.removeColumn('lint_stock_verifieds', 'te_id');
    await queryInterface.removeColumn('lint_stock_verifieds', 'scm_id');
    await queryInterface.removeColumn('lint_stock_verifieds', 'scd_id');
  }
};
