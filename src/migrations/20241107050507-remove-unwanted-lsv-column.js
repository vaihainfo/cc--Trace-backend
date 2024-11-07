'use strict';

/** @type {import('sequelize-cli').Migration} */
module.exports = {
  async up (queryInterface, Sequelize) {
    await queryInterface.removeColumn('users', 'lsv_brand');

    await queryInterface.removeColumn('users', 'lsv_program');

    await queryInterface.removeColumn('users', 'lsv_country');

    await queryInterface.removeColumn('users', 'lsv_mapped_states');

    await queryInterface.removeColumn('users', 'lsv_mapped_to');

    await queryInterface.removeColumn('users', 'lsv_mapped_ginners');

    await queryInterface.removeColumn('users', 'lsv_mapped_spinners');
  },

  async down (queryInterface, Sequelize) {
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
  }
};
