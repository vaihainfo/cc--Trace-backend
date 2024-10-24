'use strict';

/** @type {import('sequelize-cli').Migration} */
module.exports = {
  async up (queryInterface, Sequelize) {
    await queryInterface.addColumn('gin_sales', 'visible_flag', {
      type: Sequelize.BOOLEAN,
      defaultValue: true,
    });
  },

  async down (queryInterface, Sequelize) {
    await queryInterface.removeColumn('gin_sales', 'visible_flag');
  }
};
