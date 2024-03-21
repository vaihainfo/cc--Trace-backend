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
      queryInterface.addColumn('quality-parameters', 'sales_id', {
        type: Sequelize.INTEGER
      }),
      queryInterface.addColumn('quality-parameters', 'lot_no', {
        type: Sequelize.STRING
      }),
      queryInterface.addColumn('quality-parameters', 'reel_lot_no', {
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
      queryInterface.removeColumn('quality-parameters', 'sales_id'),
      queryInterface.removeColumn('quality-parameters', 'lot_no'),
      queryInterface.removeColumn('quality-parameters', 'reel_lot_no')

    ])
  }
};
