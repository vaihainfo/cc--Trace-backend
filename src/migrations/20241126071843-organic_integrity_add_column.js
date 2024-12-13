'use strict';

/** @type {import('sequelize-cli').Migration} */
module.exports = {
  async up (queryInterface, Sequelize) {
    await queryInterface.addColumn('organic_integrities', 'uploaded_reports', {
      type: Sequelize.ARRAY(Sequelize.TEXT)
    });
  },

  async down (queryInterface, Sequelize) {
    await queryInterface.removeColumn('organic_integrities', 'uploaded_reports');
  }
};

