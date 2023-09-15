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
      queryInterface.removeColumn('spin_process', 'cottonmix_type'),
      queryInterface.removeColumn('spin_process', 'cottonmix_qty')
    ])
    return await Promise.all([
      queryInterface.addColumn('spin_process', 'cottonmix_type', {
        type: Sequelize.ARRAY(Sequelize.INTEGER)
      }),
      queryInterface.addColumn('spin_process', 'cottonmix_qty', {
        type: Sequelize.ARRAY(Sequelize.INTEGER)
      }),
      queryInterface.addColumn('spin_process', 'accept_date', {
        type: Sequelize.DATE
      }),
      queryInterface.addColumn('spin_process', 'tot_box_user', {
        type: Sequelize.INTEGER
      }),
      queryInterface.addColumn('spin_process', 'display_order', {
        type: Sequelize.INTEGER
      }),
      queryInterface.addColumn('spin_process', 'qr', {
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
      queryInterface.removeColumn('spin_process', 'accept_date'),
      queryInterface.removeColumn('spin_process', 'tot_box_user'),
      queryInterface.removeColumn('spin_process', 'display_order'),
      queryInterface.removeColumn('spin_process', 'qr')
    ])
  }
};
