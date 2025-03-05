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
    await queryInterface.removeColumn('users_apps', 'acs_district');
    await queryInterface.removeColumn('users_apps', 'acs_block');
    await queryInterface.removeColumn('users_apps', 'acs_village');
    await queryInterface.removeColumn('users_apps', 'acs_ginner');
    await queryInterface.removeColumn('users_apps', 'acs_all_village');

    await queryInterface.addColumn('users_apps', 'acs_district', {
      type: Sequelize.ARRAY(Sequelize.INTEGER)
    });

    await queryInterface.addColumn('users_apps', 'acs_block', {
      type: Sequelize.ARRAY(Sequelize.INTEGER)
    });

    await queryInterface.addColumn('users_apps', 'acs_village', {
      type: Sequelize.ARRAY(Sequelize.INTEGER)
    });

    await queryInterface.addColumn('users_apps', 'acs_ginner', {
      type: Sequelize.ARRAY(Sequelize.INTEGER)
    });

    await queryInterface.addColumn('users_apps', 'acs_all_village', {
      type: Sequelize.BOOLEAN
    });
  },

  async down (queryInterface, Sequelize) {
    /**
     * Add reverting commands here.
     *
     * Example:
     * await queryInterface.dropTable('users');
     */
  }
};
