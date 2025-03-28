'use strict';

/** @type {import('sequelize-cli').Migration} */
module.exports = {
  async up (queryInterface, Sequelize) {
    await queryInterface.addColumn('lint_stock_verifieds', 'bank_warehouse_doc_te', {
      type: Sequelize.ARRAY(Sequelize.STRING)
    });

    await queryInterface.addColumn('lint_stock_verifieds', 'bank_warehouse_doc_gin', {
      type: Sequelize.ARRAY(Sequelize.STRING)
    });

    await queryInterface.addColumn('lint_stock_verifieds', 'bank_warehouse_doc_scm', {
      type: Sequelize.ARRAY(Sequelize.STRING)
    });

    await queryInterface.addColumn('lint_stock_verifieds', 'bank_warehouse_doc_scd', {
      type: Sequelize.ARRAY(Sequelize.STRING)
    });

    await queryInterface.addColumn('lint_stock_verifieds', 'bank_warehouse_doc_be', {
      type: Sequelize.ARRAY(Sequelize.STRING)
    });

    await queryInterface.addColumn('lint_stock_verifieds', 'bank_warehouse_doc_spin', {
      type: Sequelize.ARRAY(Sequelize.STRING)
    });

    await queryInterface.addColumn('lint_stock_verifieds', 'bank_warehouse_doc_bm', {
      type: Sequelize.ARRAY(Sequelize.STRING)
    });

    await queryInterface.addColumn('lint_stock_verifieds', 'bank_warehouse_doc_ps', {
      type: Sequelize.ARRAY(Sequelize.STRING)
    });
  },

  async down (queryInterface, Sequelize) {
    await queryInterface.removeColumn('lint_stock_verifieds', 'bank_warehouse_doc_te');
    await queryInterface.removeColumn('lint_stock_verifieds', 'bank_warehouse_doc_gin');
    await queryInterface.removeColumn('lint_stock_verifieds', 'bank_warehouse_doc_scm');
    await queryInterface.removeColumn('lint_stock_verifieds', 'bank_warehouse_doc_scd');
    await queryInterface.removeColumn('lint_stock_verifieds', 'bank_warehouse_doc_be');
    await queryInterface.removeColumn('lint_stock_verifieds', 'bank_warehouse_doc_spin');
    await queryInterface.removeColumn('lint_stock_verifieds', 'bank_warehouse_doc_bm');
    await queryInterface.removeColumn('lint_stock_verifieds', 'bank_warehouse_doc_ps');

  }
};
