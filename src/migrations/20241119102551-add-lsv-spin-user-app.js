'use strict';

/** @type {import('sequelize-cli').Migration} */
module.exports = {
  async up (queryInterface, Sequelize) {
    await queryInterface.addColumn('users_apps', 'be_id', {
      type: Sequelize.INTEGER
    });

    await queryInterface.addColumn('users_apps', 'bm_id', {
      type: Sequelize.INTEGER
    });

    await queryInterface.addColumn('users_apps', 'ps_id', {
      type: Sequelize.INTEGER
    });
  },

  async down (queryInterface, Sequelize) {
    await queryInterface.removeColumn('users_apps', 'be_id');

    await queryInterface.removeColumn('users_apps', 'bm_id');

    await queryInterface.removeColumn('users_apps', 'ps_id');
  }
};
