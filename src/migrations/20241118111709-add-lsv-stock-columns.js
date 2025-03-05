'use strict';

/** @type {import('sequelize-cli').Migration} */
module.exports = {
  async up (queryInterface, Sequelize) {
    await queryInterface.addColumn('lint_stock_verifieds', 'be_id', {
      type: Sequelize.INTEGER
    });

    await queryInterface.addColumn('lint_stock_verifieds', 'bm_id', {
      type: Sequelize.INTEGER
    });

    await queryInterface.addColumn('lint_stock_verifieds', 'ps_id', {
      type: Sequelize.INTEGER
    });

    await queryInterface.addColumn('lint_stock_verifieds', 'confirmed_spin_total_qty', {
      type: Sequelize.DOUBLE
    });

    await queryInterface.addColumn('lint_stock_verifieds', 'confirmed_spin_no_of_bales', {
      type: Sequelize.DOUBLE
    });

    await queryInterface.addColumn('lint_stock_verifieds', 'confirmed_bm_total_qty', {
      type: Sequelize.DOUBLE
    });

    await queryInterface.addColumn('lint_stock_verifieds', 'confirmed_bm_no_of_bales', {
      type: Sequelize.DOUBLE
    });

    await queryInterface.addColumn('lint_stock_verifieds', 'confirmed_ps_total_qty', {
      type: Sequelize.DOUBLE
    });

    await queryInterface.addColumn('lint_stock_verifieds', 'confirmed_ps_no_of_bales', {
      type: Sequelize.DOUBLE
    });

    await queryInterface.addColumn('lint_stock_verifieds', 'consent_form_be', {
      type: Sequelize.ARRAY(Sequelize.STRING)
    });

    await queryInterface.addColumn('lint_stock_verifieds', 'uploaded_photos_be', {
      type: Sequelize.ARRAY(Sequelize.STRING)
    });

    await queryInterface.addColumn('lint_stock_verifieds', 'consent_form_bm', {
      type: Sequelize.ARRAY(Sequelize.STRING)
    });

    await queryInterface.addColumn('lint_stock_verifieds', 'uploaded_photos_bm', {
      type: Sequelize.ARRAY(Sequelize.STRING)
    });

    await queryInterface.addColumn('lint_stock_verifieds', 'consent_form_ps', {
      type: Sequelize.ARRAY(Sequelize.STRING)
    });

    await queryInterface.addColumn('lint_stock_verifieds', 'uploaded_photos_ps', {
      type: Sequelize.ARRAY(Sequelize.STRING)
    });

    await queryInterface.addColumn('lint_stock_verifieds', 'status_bm', {
      type: Sequelize.STRING
    });

    await queryInterface.addColumn('lint_stock_verifieds', 'status_ps', {
      type: Sequelize.STRING
    });

  },

  async down (queryInterface, Sequelize) {
    await queryInterface.removeColumn('lint_stock_verifieds', 'be_id');
    await queryInterface.removeColumn('lint_stock_verifieds', 'bm_id');
    await queryInterface.removeColumn('lint_stock_verifieds', 'ps_id');

    await queryInterface.removeColumn('lint_stock_verifieds', 'confirmed_spin_total_qty');
    await queryInterface.removeColumn('lint_stock_verifieds', 'confirmed_spin_no_of_bales');
    await queryInterface.removeColumn('lint_stock_verifieds', 'confirmed_bm_total_qty');
    await queryInterface.removeColumn('lint_stock_verifieds', 'confirmed_bm_no_of_bales');
    await queryInterface.removeColumn('lint_stock_verifieds', 'confirmed_ps_total_qty');
    await queryInterface.removeColumn('lint_stock_verifieds', 'confirmed_ps_no_of_bales');

    await queryInterface.removeColumn('lint_stock_verifieds', 'consent_form_be');
    await queryInterface.removeColumn('lint_stock_verifieds', 'uploaded_photos_be');
    await queryInterface.removeColumn('lint_stock_verifieds', 'consent_form_bm');
    await queryInterface.removeColumn('lint_stock_verifieds', 'uploaded_photos_bm');
    await queryInterface.removeColumn('lint_stock_verifieds', 'consent_form_ps');
    await queryInterface.removeColumn('lint_stock_verifieds', 'uploaded_photos_ps');

    await queryInterface.removeColumn('lint_stock_verifieds', 'status_bm');
    await queryInterface.removeColumn('lint_stock_verifieds', 'status_ps');

  }
};
