'use strict';

/** @type {import('sequelize-cli').Migration} */
module.exports = {
  async up(queryInterface, Sequelize) {
    await queryInterface.changeColumn('gin_sales', 'invoice_no', {
      type: Sequelize.TEXT,
    });

    await queryInterface.changeColumn('gin_sales', 'transporter_name', {
      type: Sequelize.TEXT,
    });

    await queryInterface.changeColumn('gin_sales', 'vehicle_no', {
      type: Sequelize.TEXT,
    });

    await queryInterface.changeColumn('gin_sales', 'lrbl_no', {
      type: Sequelize.TEXT,
    });

    await queryInterface.changeColumn('gin_sales', 'lot_no', {
      type: Sequelize.TEXT,
    });

    await queryInterface.changeColumn('gin_sales', 'press_no', {
      type: Sequelize.TEXT,
    });

    await queryInterface.changeColumn('gin_sales', 'contract_file', {
      type: Sequelize.TEXT,
    });

    await queryInterface.changeColumn('gin_sales', 'tc_file', {
      type: Sequelize.TEXT,
    });

    await queryInterface.changeColumn('gin_sales', 'delivery_notes', {
      type: Sequelize.TEXT,
    });
  },

  async down(queryInterface, Sequelize) {
    await queryInterface.changeColumn('gin_sales', 'invoice_no', {
      type: Sequelize.STRING,
    });

    await queryInterface.changeColumn('gin_sales', 'transporter_name', {
      type: Sequelize.STRING,
    });

    await queryInterface.changeColumn('gin_sales', 'vehicle_no', {
      type: Sequelize.STRING,
    });

    await queryInterface.changeColumn('gin_sales', 'lrbl_no', {
      type: Sequelize.STRING,
    });

    await queryInterface.changeColumn('gin_sales', 'lot_no', {
      type: Sequelize.STRING,
    });

    await queryInterface.changeColumn('gin_sales', 'press_no', {
      type: Sequelize.STRING,
    });

    await queryInterface.changeColumn('gin_sales', 'contract_file', {
      type: Sequelize.STRING,
    });

    await queryInterface.changeColumn('gin_sales', 'tc_file', {
      type: Sequelize.STRING,
    });

    await queryInterface.changeColumn('gin_sales', 'delivery_notes', {
      type: Sequelize.STRING,
    });
  }
};
