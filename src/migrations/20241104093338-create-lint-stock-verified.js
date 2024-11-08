'use strict';
/** @type {import('sequelize-cli').Migration} */
module.exports = {
  async up(queryInterface, Sequelize) {
    await queryInterface.createTable('lint_stock_verifieds', {
      id: {
        allowNull: false,
        autoIncrement: true,
        primaryKey: true,
        type: Sequelize.INTEGER
      },
      country_id: {
        type: Sequelize.INTEGER,
        allowNull: false
      },
      state_id: {
        type: Sequelize.INTEGER,
        allowNull: false
      },
      ginner_id: {
        type: Sequelize.INTEGER
      },
      spinner_id: {
        type: Sequelize.INTEGER
      },
      processor_type: {
        type: Sequelize.STRING
      },
      process_id: {
        type: Sequelize.INTEGER
      },
      sales_id: {
        type: Sequelize.INTEGER
      },
      lot_no: {
        type: Sequelize.TEXT
      },
      reel_lot_no: {
        type: Sequelize.TEXT
      },
      total_qty: {
        type: Sequelize.DOUBLE
      },
      no_of_bales: {
        type: Sequelize.DOUBLE
      },
      actual_total_qty: {
        type: Sequelize.DOUBLE
      },
      actual_no_of_bales: {
        type: Sequelize.DOUBLE
      },
      consent_form_te: {
        type: Sequelize.ARRAY(Sequelize.STRING)
      },
      uploaded_photos_te: {
        type: Sequelize.ARRAY(Sequelize.STRING)
      },
      consent_form_scm: {
        type: Sequelize.ARRAY(Sequelize.STRING)
      },
      uploaded_photos_scm: {
        type: Sequelize.ARRAY(Sequelize.STRING)
      },
      consent_form_scd: {
        type: Sequelize.ARRAY(Sequelize.STRING)
      },
      uploaded_photos_scd: {
        type: Sequelize.ARRAY(Sequelize.STRING)
      },
      consent_form_ginner: {
        type: Sequelize.ARRAY(Sequelize.STRING)
      },
      uploaded_photos_ginner: {
        type: Sequelize.ARRAY(Sequelize.STRING)
      },
      consent_form_spinner: {
        type: Sequelize.ARRAY(Sequelize.STRING)
      },
      uploaded_photos_spinner: {
        type: Sequelize.ARRAY(Sequelize.STRING)
      },
      status: {
        type: Sequelize.STRING
      },
      status_scm: {
        type: Sequelize.STRING
      },
      status_scd: {
        type: Sequelize.STRING
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
    await queryInterface.dropTable('lint_stock_verifieds');
  }
};