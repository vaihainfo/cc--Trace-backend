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
    await queryInterface.createTable("export_spinner_bale_receipts", {
      id: {
        type: Sequelize.INTEGER,
        autoIncrement: true,
        allowNull: false,
        primaryKey: true,
      },

      accept_date: {
        allowNull: true,
        type: Sequelize.STRING,
      },

      date: {
        allowNull: true,
        type: Sequelize.STRING,
      },
      season: {
        allowNull: true,
        type: Sequelize.STRING,
      },
      spinner: {
        allowNull: true,
        type: Sequelize.STRING,
      },
      ginner: {
        allowNull: true,
        type: Sequelize.STRING,
      },
      invoice: {
        allowNull: true,
        type: Sequelize.STRING,
      },
      lot_no: {
        allowNull: true,
        type: Sequelize.STRING,
      },
      reel_lot_no: {
        allowNull: true,
        type: Sequelize.STRING,
      },
      press_no: {
        allowNull: true,
        type: Sequelize.STRING,
      },
      no_of_bales: {
        allowNull: true,
        type: Sequelize.STRING,
      },
      lint_quantity: {
        allowNull: true,
        type: Sequelize.STRING,
      },
      program: {
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
      ginnerId: {
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
     *
     */
    await queryInterface.dropTable("export_spinner_bale_receipts");
  },
};
