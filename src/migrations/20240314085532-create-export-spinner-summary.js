"use strict";

/** @type {import('sequelize-cli').Migration} */
module.exports = {
  async up(queryInterface, Sequelize) {
    /**
     * Add altering commands here.
     *
     * Example:
     * await queryInterface.createTable('users', { id: Sequelize.INTEGER });
     */
    await queryInterface.createTable("export_spinner_summaries", {
      id: {
        type: Sequelize.INTEGER,
        autoIncrement: true,
        allowNull: false,
        primaryKey: true,
      },

      name: {
        allowNull: true,
        type: Sequelize.STRING,
      },

      lint_cotton_procured: {
        allowNull: true,
        type: Sequelize.STRING,
      },
      lint_cotton_procured_pending: {
        allowNull: true,
        type: Sequelize.STRING,
      },
      lint_consumed: {
        allowNull: true,
        type: Sequelize.STRING,
      },
      balance_lint_cotton: {
        allowNull: true,
        type: Sequelize.STRING,
      },
      yarn_procured: {
        allowNull: true,
        type: Sequelize.STRING,
      },
      yarn_sold: {
        allowNull: true,
        type: Sequelize.STRING,
      },
      yarn_stock: {
        allowNull: true,
        type: Sequelize.STRING,
      },
      countryId: {
        allowNull: true,
        type: Sequelize.INTEGER,
      },
      brandId: {
        allowNull: true,
        type: Sequelize.INTEGER,
      },
      spinnerId: {
        allowNull: true,
        type: Sequelize.INTEGER,
      },
      seasonId: {
        allowNull: true,
        type: Sequelize.INTEGER,
      },
      programId: {
        allowNull: true,
        type: Sequelize.INTEGER,
      },
      createdAt: {
        allowNull: false,
        type: Sequelize.DATE,
      },
      updatedAt: {
        allowNull: false,
        type: Sequelize.DATE,
      },
    });
  },

  async down(queryInterface, Sequelize) {
    /**
     * Add reverting commands here.
     *
     * Example:
     * await queryInterface.dropTable('users');
     */
    await queryInterface.dropTable("export_spinner_summaries");
  },
};
