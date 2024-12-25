'use strict';

/** @type {import('sequelize-cli').Migration} */
module.exports = {
  async up(queryInterface, Sequelize) {
    await queryInterface.addColumn('spin_processes', 'yarn_blend_id', {
      type: Sequelize.INTEGER
    });
  },

  async down(queryInterface, Sequelize) {
    await queryInterface.removeColumn('spin_processes', 'yarn_blend_id');
  }
};
