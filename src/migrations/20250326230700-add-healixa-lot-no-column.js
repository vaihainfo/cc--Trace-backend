'use strict';

/** @type {import('sequelize-cli').Migration} */
module.exports = {
  async up(queryInterface, Sequelize) {
    await queryInterface.addColumn('physical_traceability_data_ginners', 'healixa_lot_no', {
      type: Sequelize.STRING,
      allowNull: true,
      after: 'cotton_connect_executive_name'
    });
  },

  async down(queryInterface, Sequelize) {
    await queryInterface.removeColumn('physical_traceability_data_ginners', 'healixa_lot_no');
  }
};
