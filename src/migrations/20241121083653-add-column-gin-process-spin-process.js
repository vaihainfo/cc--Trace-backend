'use strict';

/** @type {import('sequelize-cli').Migration} */
module.exports = {
  async up(queryInterface, Sequelize) {
    await queryInterface.addColumn('gin_processes', 'from_date', {
      type: Sequelize.DATE,
      defaultValue: null,
      allowNull: true
    });
    await queryInterface.addColumn('gin_processes', 'to_date', {
      type: Sequelize.DATE,
      defaultValue: null,
      allowNull: true
    });
    await queryInterface.addColumn('spin_processes', 'from_date', {
      type: Sequelize.DATE,
      defaultValue: null,
      allowNull: true
    });
    await queryInterface.addColumn('spin_processes', 'to_date', {
      type: Sequelize.DATE,
      defaultValue: null,
      allowNull: true
    });
  },

  async down(queryInterface, Sequelize) {
    /**
     * Add reverting commands here.
     *
     * Example:
     * await queryInterface.dropTable('users');
     */
  }
};
