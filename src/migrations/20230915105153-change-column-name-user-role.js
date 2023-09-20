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

    await queryInterface.addColumn('user_roles', 'brand_id', {
      type: Sequelize.INTEGER
    })
  },

  async down(queryInterface, Sequelize) {
    await queryInterface.removeColumn('user_roles', 'brand_id')
    /**
     * Add reverting commands here.
     *
     * Example:
     * await queryInterface.dropTable('users');
     */
  }
};
