'use strict';

/** @type {import('sequelize-cli').Migration} */
module.exports = {
  async up (queryInterface, Sequelize) {
    await queryInterface.removeColumn('spin_processes', 'yarn_blend_id');
  },

  async down (queryInterface, Sequelize) {

  }
};
