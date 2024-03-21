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
    queryInterface.addColumn('gin_processes', 'heap_number', {
      type: Sequelize.STRING
    });

    queryInterface.addColumn('gin_processes', 'heap_register', {
      type: Sequelize.STRING
    });

    queryInterface.addColumn('gin_processes', 'weigh_bridge', {
      type: Sequelize.STRING
    });

    queryInterface.addColumn('gin_processes', 'delivery_challan', {
      type: Sequelize.STRING
    });

    queryInterface.addColumn('gin_processes', 'bale_process', {
      type: Sequelize.STRING
    });
  },

  async down (queryInterface, Sequelize) {
    /**
     * Add reverting commands here.
     *
     * Example:
     * await queryInterface.dropTable('users');
     */

    await queryInterface.removeColumn('gin_processes', 'heap_number');
    await queryInterface.removeColumn('gin_processes', 'heap_register');
    await queryInterface.removeColumn('gin_processes', 'weigh_bridge');
    await queryInterface.removeColumn('gin_processes', 'delivery_challan');
    await queryInterface.removeColumn('gin_processes', 'bale_process');
  }
};
