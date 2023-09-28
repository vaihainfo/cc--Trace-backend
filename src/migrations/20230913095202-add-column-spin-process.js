'use strict';

/** @type {import('sequelize-cli').Migration} */
module.exports = {
  async up(queryInterface, Sequelize) {
    /**
     * Add altering commands here.
     *
     * Example:
     * await queryInterface.createTable('users', { id: Sequelize.INTEGER });
     */
    await Promise.all([
      queryInterface.removeColumn('spin_processes', 'cottonmix_type'),
      queryInterface.removeColumn('spin_processes', 'cottonmix_qty')
    ])
    return await Promise.all([
      queryInterface.addColumn('spin_processes', 'cottonmix_type', {
        type: Sequelize.ARRAY(Sequelize.INTEGER)
      }),
      queryInterface.addColumn('spin_processes', 'cottonmix_qty', {
        type: Sequelize.ARRAY(Sequelize.INTEGER)
      }),
      queryInterface.addColumn('spin_processes', 'accept_date', {
        type: Sequelize.DATE
      }),
      queryInterface.addColumn('spin_processes', 'tot_box_user', {
        type: Sequelize.INTEGER
      }),
      queryInterface.addColumn('spin_processes', 'display_order', {
        type: Sequelize.INTEGER
      }),
      queryInterface.addColumn('spin_processes', 'qr', {
        type: Sequelize.STRING
      }),

    ])
  },

  async down(queryInterface, Sequelize) {
    /**
     * Add reverting commands here.
     *
     * Example:
     * await queryInterface.dropTable('users');
     */
    return await Promise.all([
      queryInterface.removeColumn('spin_processes', 'accept_date'),
      queryInterface.removeColumn('spin_processes', 'tot_box_user'),
      queryInterface.removeColumn('spin_processes', 'display_order'),
      queryInterface.removeColumn('spin_processes', 'qr')
    ])
  }
};
