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
      queryInterface.addColumn('weavers', 'short_name', {
        type: Sequelize.STRING
      }),
      queryInterface.addColumn('garments', 'short_name', {
        type: Sequelize.STRING
      }),
      queryInterface.addColumn('fabrics', 'short_name', {
        type: Sequelize.STRING
      }),
      queryInterface.addColumn('knitters', 'short_name', {
        type: Sequelize.STRING
      }),
      queryInterface.addColumn('traders', 'short_name', {
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
      queryInterface.removeColumn('weavers', 'short_name'),
      queryInterface.removeColumn('garments', 'short_name'),
      queryInterface.removeColumn('fabrics', 'short_name'),
      queryInterface.removeColumn('knitters', 'short_name'),
      queryInterface.removeColumn('traders', 'short_name')
    ])
  }
};
