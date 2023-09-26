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

    return await Promise.all([
      queryInterface.addColumn('garment_sales', 'accept_date', {
        type: Sequelize.DATE
      }),
      queryInterface.addColumn('garment_sales', 'qr', {
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
      queryInterface.removeColumn('garment_sales', 'accept_date'),
      queryInterface.removeColumn('garment_sales', 'qr')
    ])
  }
};
