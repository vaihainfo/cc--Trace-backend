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
    await queryInterface.removeColumn('weaver_processes', 'yarn_type');
    await queryInterface.removeColumn('weaver_processes', 'yarn_count');
    await queryInterface.removeColumn('knit_processes', 'fabric_gsm');
    await queryInterface.removeColumn('knit_processes', 'yarn_type');
    await queryInterface.removeColumn('knit_processes', 'yarn_count');

    await queryInterface.addColumn('knit_processes', 'fabric_gsm', {
      type: Sequelize.ARRAY(Sequelize.STRING)
    })

    await queryInterface.addColumn('knit_processes', 'yarn_type', {
      type: Sequelize.STRING
    })

    await queryInterface.addColumn('knit_processes', 'yarn_count', {
      type: Sequelize.INTEGER
    })
    await queryInterface.addColumn('weaver_processes', 'yarn_type', {
      type: Sequelize.STRING
    })
    await queryInterface.addColumn('weaver_processes', 'yarn_count', {
      type: Sequelize.INTEGER
    })

  },

  async down (queryInterface, Sequelize) {
    /**
     * Add reverting commands here.
     *
     * Example:
     * await queryInterface.dropTable('users');
     */
    await queryInterface.addColumn('knit_processes', 'fabric_gsm', {
      type: Sequelize.ARRAY(Sequelize.STRING)
    })

    await queryInterface.addColumn('knit_processes', 'yarn_type', {
      type: Sequelize.STRING
    })

    await queryInterface.addColumn('knit_processes', 'yarn_count', {
      type: Sequelize.INTEGER
    })
    await queryInterface.addColumn('weaver_processes', 'yarn_type', {
      type: Sequelize.STRING
    })
    await queryInterface.addColumn('weaver_processes', 'yarn_count', {
      type: Sequelize.INTEGER
    })
  }
};
