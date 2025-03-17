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
    await queryInterface.addColumn('users', 'lsv_brand', {
      type: Sequelize.ARRAY(Sequelize.INTEGER)
    });

    await queryInterface.addColumn('users', 'lsv_program', {
      type: Sequelize.INTEGER
    });

    await queryInterface.addColumn('users', 'lsv_country', {
      type: Sequelize.INTEGER
    });

    await queryInterface.addColumn('users', 'lsv_mapped_states', {
      type: Sequelize.ARRAY(Sequelize.INTEGER)
    });

    await queryInterface.addColumn('users', 'lsv_mapped_to', {
      type: Sequelize.STRING
    });

    await queryInterface.addColumn('users', 'lsv_mapped_ginners', {
      type: Sequelize.ARRAY(Sequelize.INTEGER)
    });

    await queryInterface.addColumn('users', 'lsv_mapped_spinners', {
      type: Sequelize.ARRAY(Sequelize.INTEGER)
    });

    await queryInterface.addColumn('users', 'is_lsv_user', {
      type: Sequelize.BOOLEAN,
      defaultValue: false,
    });
  },

  async down (queryInterface, Sequelize) {
    /**
     * Add reverting commands here.
     *
     * Example:
     * await queryInterface.dropTable('users');
     */
    await queryInterface.removeColumn('users', 'lsv_brand');

    await queryInterface.removeColumn('users', 'lsv_program');

    await queryInterface.removeColumn('users', 'lsv_country');

    await queryInterface.removeColumn('users', 'lsv_mapped_states');

    await queryInterface.removeColumn('users', 'lsv_mapped_to');

    await queryInterface.removeColumn('users', 'lsv_mapped_ginners');

    await queryInterface.removeColumn('users', 'lsv_mapped_spinners');

    await queryInterface.removeColumn('users', 'is_lsv_user');
  }
};
