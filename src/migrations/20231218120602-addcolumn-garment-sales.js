'use strict';

/** @type {import('sequelize-cli').Migration} */
module.exports = {
  async up (queryInterface, Sequelize) {
    /**
     * Add altering commands here.
     *
     * Example:s
     * await queryInterface.createTable('users', { id: Sequelize.INTEGER });
     */
    await queryInterface.addColumn('garment_sales', 'color', {
      type: Sequelize.ARRAY(Sequelize.STRING)
    });
    await queryInterface.addColumn('garment_sales', 'garment_size', {
      type: Sequelize.ARRAY(Sequelize.STRING)
    });
    await queryInterface.addColumn('garment_sales', 'no_of_pieces', {
      type: Sequelize.ARRAY(Sequelize.INTEGER)
    });
    await queryInterface.addColumn('garment_sales', 'no_of_boxes', {
      type: Sequelize.ARRAY(Sequelize.INTEGER)
    });
  },

  async down (queryInterface, Sequelize) {
    /**
     * Add reverting commands here.
     *
     * Example:
     * await queryInterface.dropTable('users');
     */
  }
};
