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
    await queryInterface.createTable("export_spinner_yarn_processes", {
      id: {
        type: Sequelize.INTEGER,
        autoIncrement: true,
        allowNull: false,
        primaryKey: true,
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
      lotNo: {
        allowNull: true,
        type: Sequelize.STRING,
      },
      reel_lot_no: {
        allowNull: true,
        type: Sequelize.STRING,
      },
      yarnType: {
        allowNull: true,
        type: Sequelize.STRING,
      },
      count: {
        allowNull: true,
        type: Sequelize.STRING,
      },
      resa: {
        allowNull: true,
        type: Sequelize.STRING,
      },
      comber: {
        allowNull: true,
        type: Sequelize.STRING,
      },
      blend: {
        allowNull: true,
        type: Sequelize.STRING,
      },
      blendqty: {
        allowNull: true,
        type: Sequelize.STRING,
      },
      cotton_consumed: {
        allowNull: true,
        type: Sequelize.STRING,
      },
      program: {
        allowNull: true,
        type: Sequelize.STRING,
      },
      total: {
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
    await queryInterface.dropTable("export_spinner_yarn_processes");
  },
};
