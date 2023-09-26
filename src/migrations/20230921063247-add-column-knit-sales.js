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
      queryInterface.removeColumn('knit_sales', 'cottonmix_type'),
      queryInterface.removeColumn('knit_sales', 'cottonmix_qty')
    ])
    return await Promise.all([
      queryInterface.addColumn('knit_sales', 'cottonmix_type', {
        type: Sequelize.ARRAY(Sequelize.INTEGER)
      }),
      queryInterface.addColumn('knit_sales', 'cottonmix_qty', {
        type: Sequelize.ARRAY(Sequelize.DOUBLE)
      }),
      queryInterface.addColumn('knit_sales', 'accept_date', {
        type: Sequelize.DATE
      }),
      queryInterface.addColumn('knit_sales', 'blend_choose', {
        type: Sequelize.BOOLEAN
      }),
      queryInterface.addColumn('knit_sales', 'qr', {
        type: Sequelize.STRING
      })

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
      queryInterface.removeColumn('knit_sales', 'cottonmix_type'),
      queryInterface.removeColumn('knit_sales', 'cottonmix_qty'),
      queryInterface.removeColumn('knit_sales', 'accept_date'),
      queryInterface.removeColumn('knit_sales', 'qr')
    ])
  }
};
