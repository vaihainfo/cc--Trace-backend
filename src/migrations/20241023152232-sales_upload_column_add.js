'use strict';

/** @type {import('sequelize-cli').Migration} */
module.exports = {
  async up (queryInterface, Sequelize) {
    await queryInterface.addColumn('gin_sales', 'letter_of_credit', {
      type: Sequelize.ARRAY(Sequelize.TEXT)
    });
    await queryInterface.addColumn('gin_sales', 'logistics_documents', {
      type: Sequelize.ARRAY(Sequelize.TEXT)
    });

    await queryInterface.addColumn('spin_sales', 'letter_of_credit', {
      type: Sequelize.ARRAY(Sequelize.TEXT)
    });
    await queryInterface.addColumn('spin_sales', 'logistics_documents', {
      type: Sequelize.ARRAY(Sequelize.TEXT)
    });
    await queryInterface.addColumn('spin_sales', 'yarn_quality_test_reports', {
      type: Sequelize.ARRAY(Sequelize.TEXT)
    });
  },

  async down (queryInterface, Sequelize) {
    await queryInterface.removeColumn('gin_sales', 'letter_of_credit');
    await queryInterface.removeColumn('gin_sales', 'logistics_documents');
    await queryInterface.removeColumn('spin_sales', 'letter_of_credit');
    await queryInterface.removeColumn('spin_sales', 'logistics_documents');
    await queryInterface.removeColumn('spin_sales', 'yarn_quality_test_reports');
  }
};
