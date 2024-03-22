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
    await queryInterface.createTable('seed_testing_linkages', {
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
      seed_company_id: {
        type: Sequelize.INTEGER,
        allowNull: false
      },
      lotno: {
        type: Sequelize.STRING,
        allowNull: false
      },
      variety: {
        type: Sequelize.STRING,
        allowNull: false
      },
      packets: {
        type: Sequelize.STRING,
        allowNull: false
      },
      district: {
        type: Sequelize.STRING,
        allowNull: false
      },
      state: {
        type: Sequelize.STRING,
        allowNull: false
      },
      testing_code: {
        type: Sequelize.STRING,
        allowNull: false
      },
      seal_no: {
        type: Sequelize.STRING,
        allowNull: false
      },
      date_sending_sample: {
        type: Sequelize.DATE,
        allowNull: false
      },
      date_of_report: {
        type: Sequelize.DATE,
        allowNull: false
      },
      report_no: {
        type: Sequelize.STRING,
        allowNull: false
      },
      nos: {
        type: Sequelize.STRING,
        allowNull: false
      },
      thirtyfives: {
        type: Sequelize.STRING,
        allowNull: false
      },
      result_of_lab: {
        type: Sequelize.STRING,
        allowNull: false
      },
      lab_master_id: {
        type: Sequelize.INTEGER,
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
    await queryInterface.dropTable('seed_testing_linkages');
  }
};
