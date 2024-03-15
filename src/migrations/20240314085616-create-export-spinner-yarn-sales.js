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
    await queryInterface.createTable("export_spinner_yarn_sales", {
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
      buyer_id: {
        allowNull: true,
        type: Sequelize.STRING,
      },
      invoice: {
        allowNull: true,
        type: Sequelize.STRING,
      },

      lotNo: {
        allowNull: true,
        type: Sequelize.STRING,
      },
      order_ref: {
        allowNull: true,
        type: Sequelize.STRING,
      },
      reelLot: {
        allowNull: true,
        type: Sequelize.STRING,
      },
      count: {
        allowNull: true,
        type: Sequelize.STRING,
      },
      boxes: {
        allowNull: true,
        type: Sequelize.STRING,
      },
      boxId: {
        allowNull: true,
        type: Sequelize.STRING,
      },
      price: {
        allowNull: true,
        type: Sequelize.STRING,
      },
      total: {
        allowNull: true,
        type: Sequelize.STRING,
      },
      transporter_name: {
        allowNull: true,
        type: Sequelize.STRING,
      },
      vehicle_no: {
        allowNull: true,
        type: Sequelize.STRING,
      },
      agent: {
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
    await queryInterface.dropTable("export_spinner_yarn_sales");
  },
};
