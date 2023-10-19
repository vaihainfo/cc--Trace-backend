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
      queryInterface.addColumn('spinners', 'district_id', {
        type: Sequelize.INTEGER
      }),
      queryInterface.addColumn('ginners', 'district_id', {
        type: Sequelize.INTEGER
      }),
      queryInterface.addColumn('weavers', 'district_id', {
        type: Sequelize.INTEGER
      }),
      queryInterface.addColumn('garments', 'district_id', {
        type: Sequelize.INTEGER
      }),
      queryInterface.addColumn('fabrics', 'district_id', {
        type: Sequelize.INTEGER
      }),
      queryInterface.addColumn('knitters', 'district_id', {
        type: Sequelize.INTEGER
      }),
      queryInterface.addColumn('traders', 'district_id', {
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
      queryInterface.removeColumn('spinners', 'district_id'),
      queryInterface.removeColumn('ginners', 'district_id'),
      queryInterface.removeColumn('weavers', 'district_id'),
      queryInterface.removeColumn('garments', 'district_id'),
      queryInterface.removeColumn('fabrics', 'district_id'),
      queryInterface.removeColumn('knitters', 'district_id'),
      queryInterface.removeColumn('traders', 'district_id')
    ]);
  }
};
