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
    await queryInterface.createTable('seed_demands', {
      id: {
        type: Sequelize.INTEGER,
        autoIncrement: true,
        allowNull: false,
        primaryKey: true
      },
      season_id: {
        type: Sequelize.INTEGER,
        allowNull: false
      },
      project_name: {
        type: Sequelize.STRING,
        allowNull: false
      },
      seed_company_id: {
        type: Sequelize.INTEGER,
        allowNull: false
      },
      seed_variety: {
        type: Sequelize.STRING,
        allowNull: false
      },
      numbers_of_packets: {
        type: Sequelize.STRING,
        allowNull: false
      },
      project_location: {
        type: Sequelize.STRING,
        allowNull: false
      },
      remark: {
        type: Sequelize.STRING,
        allowNull: false
      },
      createdAt: {
        allowNull: false,
        type: Sequelize.DATE
      },
      updatedAt: {
        allowNull: false,
        type: Sequelize.DATE
      }
    });
  },

  async down(queryInterface, Sequelize) {
    /**
     * Add reverting commands here.
     *
     * Example:
     * await queryInterface.dropTable('users');
     */
    await queryInterface.dropTable('seed_demands');
  }
};
