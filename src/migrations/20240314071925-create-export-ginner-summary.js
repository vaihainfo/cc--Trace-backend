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
    await queryInterface.createTable("export_ginner_summaries", {
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

      cottonProcuredMt: {
        allowNull: true,
        type: Sequelize.STRING,
      },
      cottonProcessedeMt: {
        allowNull: true,
        type: Sequelize.STRING,
      },
      cottonStockMt: {
        allowNull: true,
        type: Sequelize.STRING,
      },
      lintProcuredMt: {
        allowNull: true,
        type: Sequelize.STRING,
      },
      lintSoldMt: {
        allowNull: true,
        type: Sequelize.STRING,
      },
      lintStockMt: {
        allowNull: true,
        type: Sequelize.INTEGER,
      },
      balesProduced: {
        allowNull: true,
        type: Sequelize.INTEGER,
      },
      balesSold: {
        allowNull: true,
        type: Sequelize.INTEGER,
      },
      balesStock: {
        allowNull: true,
        type: Sequelize.INTEGER,
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
    await queryInterface.dropTable("export_ginner_summaries");
  },
};
