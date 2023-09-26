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
      queryInterface.addColumn('farms', 'cotton_transacted', {
        type: Sequelize.DECIMAL
      }),
      queryInterface.addColumn('transactions', 'estimated_cotton', {
        type: Sequelize.DOUBLE
      }),
      queryInterface.addColumn('transactions', 'accept_date', {
        type: Sequelize.DATE
      }),
      queryInterface.addColumn('transactions', 'available_cotton', {
        type: Sequelize.DOUBLE
      }),
      queryInterface.addColumn('transactions', 'farm_id', {
        type: Sequelize.INTEGER
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
      queryInterface.removeColumn('farms', 'cotton_transacted'),
      queryInterface.removeColumn('transactions', 'estimated_cotton'),
      queryInterface.removeColumn('transactions', 'accept_date'),
      queryInterface.removeColumn('transactions', 'available_cotton'),
      queryInterface.removeColumn('transactions', 'farm_id')
    ])
  }
};
