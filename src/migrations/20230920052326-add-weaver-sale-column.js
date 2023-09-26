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
      queryInterface.removeColumn('weaver_sales', 'weft_cottonmix_type'),
      queryInterface.removeColumn('weaver_sales', 'weft_cottonmix_qty')
    ])
    return await Promise.all([
      queryInterface.addColumn('weaver_sales', 'weft_cottonmix_type', {
        type: Sequelize.ARRAY(Sequelize.INTEGER)
      }),
      queryInterface.addColumn('weaver_sales', 'weft_cottonmix_qty', {
        type: Sequelize.ARRAY(Sequelize.DOUBLE)
      }),
      queryInterface.addColumn('weaver_sales', 'accept_date', {
        type: Sequelize.DATE
      }),
      queryInterface.addColumn('weaver_sales', 'no_of_bales', {
        type: Sequelize.DOUBLE
      }),
      queryInterface.addColumn('weaver_sales', 'qr', {
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
      queryInterface.removeColumn('weaver_sales', 'weft_cottonmix_type'),
      queryInterface.removeColumn('weaver_sales', 'weft_cottonmix_qty'),
      queryInterface.removeColumn('weaver_sales', 'accept_date'),
      queryInterface.removeColumn('weaver_sales', 'no_of_bales'),
      queryInterface.removeColumn('weaver_sales', 'qr')
    ])
  }
};
