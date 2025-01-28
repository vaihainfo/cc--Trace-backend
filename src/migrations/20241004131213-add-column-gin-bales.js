'use strict';

/** @type {import('sequelize-cli').Migration} */
module.exports = {
  async up (queryInterface, Sequelize) {
    await queryInterface.addColumn('gin-bales', 'is_all_rejected', {
      type: Sequelize.BOOLEAN,
    });
  },

  async down (queryInterface, Sequelize) {
    await queryInterface.removeColumn('gin-bales', 'is_all_rejected');
  }
};
