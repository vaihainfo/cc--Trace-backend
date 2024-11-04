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
    await queryInterface.addColumn('users_apps', 'lsv_brand', {
      type: Sequelize.ARRAY(Sequelize.INTEGER)
    });

    await queryInterface.addColumn('users_apps', 'lsv_country', {
      type: Sequelize.INTEGER
    });

    await queryInterface.addColumn('users_apps', 'lsv_mapped_states', {
      type: Sequelize.ARRAY(Sequelize.INTEGER)
    });

    await queryInterface.addColumn('users_apps', 'lsv_mapped_to', {
      type: Sequelize.STRING
    });

    await queryInterface.addColumn('users_apps', 'lsv_mapped_ginners', {
      type: Sequelize.ARRAY(Sequelize.INTEGER)
    });

    await queryInterface.addColumn('users_apps', 'lsv_mapped_spinners', {
      type: Sequelize.ARRAY(Sequelize.INTEGER)
    });

  },

  async down (queryInterface, Sequelize) {
    await queryInterface.removeColumn('users_apps', 'lsv_brand');

    await queryInterface.removeColumn('users_apps', 'lsv_country');

    await queryInterface.removeColumn('users_apps', 'lsv_mapped_states');

    await queryInterface.removeColumn('users_apps', 'lsv_mapped_to');

    await queryInterface.removeColumn('users_apps', 'lsv_mapped_ginners');

    await queryInterface.removeColumn('users_apps', 'lsv_mapped_spinners');
  }
};
