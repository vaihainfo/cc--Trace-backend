'use strict';

/** @type {import('sequelize-cli').Migration} */
module.exports = {
  async up (queryInterface, Sequelize) {
    /**
     * Add altering commands here.
     *
     * Example:
     * await queryInterface.createTable('users', { id: Sequelize.INTEGER });
     */
    await queryInterface.addColumn('users_apps', 'te_id', {
      type: Sequelize.INTEGER
    });

    await queryInterface.addColumn('users_apps', 'scm_id', {
      type: Sequelize.INTEGER
    });

    await queryInterface.addColumn('users_apps', 'scd_id', {
      type: Sequelize.INTEGER
    });
  },

  async down (queryInterface, Sequelize) {
    await queryInterface.removeColumn('users_apps', 'te_id');

    await queryInterface.removeColumn('users_apps', 'scm_id');

    await queryInterface.removeColumn('users_apps', 'scd_id');
  }
};
