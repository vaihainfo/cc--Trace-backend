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
    await queryInterface.addColumn('farms', 'cluster', {
      type: Sequelize.STRING,
      allowNull: true,
      defaultValue: null
    });
    await queryInterface.addColumn('farms', 'seed_packet_quantity', {
      type: Sequelize.STRING,
      allowNull: true,
      defaultValue: null
    });
    await queryInterface.addColumn('farms', 'variety', {
      type: Sequelize.STRING,
      allowNull: true,
      defaultValue: null
    });
    await queryInterface.addColumn('farms', 'lot_no', {
      type: Sequelize.STRING,
      allowNull: true,
      defaultValue: null
    });
    await queryInterface.addColumn('farms', 'distribution_date', {
      type: Sequelize.DATE,
      allowNull: true,
      defaultValue: null
    });
    await queryInterface.addColumn('farms', 'source_of_seed', {
      type: Sequelize.STRING,
      allowNull: true,
      defaultValue: null
    });
  },

  async down(queryInterface, Sequelize) {
    /**
     * Add reverting commands here.
     *
     * Example:
     * await queryInterface.dropTable('users');
     */
    await queryInterface.removeColumn('farms', 'cluster');
    await queryInterface.removeColumn('farms', 'seed_packet_quantity');
    await queryInterface.removeColumn('farms', 'variety');
    await queryInterface.removeColumn('farms', 'lot_no');
    await queryInterface.removeColumn('farms', 'distribution_date');
    await queryInterface.removeColumn('farms', 'source_of_seed');
  }
};
