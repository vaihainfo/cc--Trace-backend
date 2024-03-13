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
    await queryInterface.createTable("export_ginner_lintbale_processes", {
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
      ginner: {
        allowNull: true,
        type: Sequelize.STRING,
      },
      invoice: {
        allowNull: true,
        type: Sequelize.STRING,
      },
      buyer: {
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
      no_of_bales: {
        allowNull: true,
        type: Sequelize.STRING,
      },
      press_no: {
        allowNull: true,
        type: Sequelize.STRING,
      },
      rate: {
        allowNull: true,
        type: Sequelize.STRING,
      },
      total_qty: {
        allowNull: true,
        type: Sequelize.STRING,
      },
      program: {
        allowNull: true,
        type: Sequelize.STRING,
      },
      status: {
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
      created_date: {
        allowNull: true,
        type: Sequelize.STRING,
      },
      process_no: {
        allowNull: true,
        type: Sequelize.STRING,
      },
      lint_qty: {
        allowNull: true,
        type: Sequelize.STRING,
      },
      seedConsmed: {
        allowNull: true,
        type: Sequelize.STRING,
      },
      got: {
        allowNull: true,
        type: Sequelize.STRING,
      },
      lint_quantity_sold: {
        allowNull: true,
        type: Sequelize.STRING,
      },
      sold_bales: {
        allowNull: true,
        type: Sequelize.STRING,
      },
      lint_stock: {
        allowNull: true,
        type: Sequelize.STRING,
      },
      bale_stock: {
        allowNull: true,
        type: Sequelize.STRING,
      },
      village: {
        allowNull: true,
        type: Sequelize.STRING,
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
    await queryInterface.dropTable("export_ginner_lintbale_processes");
  },
};
