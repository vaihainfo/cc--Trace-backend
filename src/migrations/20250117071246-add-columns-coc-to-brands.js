'use strict';

/** @type {import('sequelize-cli').Migration} */
module.exports = {
  async up (queryInterface, Sequelize) {
    await queryInterface.addColumn('brands', 'gin_auth_code_count', {
      type: Sequelize.INTEGER,
      defaultValue: 0
    });

    await queryInterface.addColumn('brands', 'garment_auth_code_count', {
      type: Sequelize.INTEGER,
      defaultValue: 0
    });
  },

  async down (queryInterface, Sequelize) {
    await queryInterface.removeColumn('brands', 'gin_auth_code_count');
    await queryInterface.removeColumn('brands', 'garment_auth_code_count');
  }
};
