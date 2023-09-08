'use strict';
/** @type {import('sequelize-cli').Migration} */
module.exports = {
  async up(queryInterface, Sequelize) {
    await queryInterface.createTable('quality-parameters', {
      id: {
        allowNull: false,
        autoIncrement: true,
        primaryKey: true,
        type: Sequelize.INTEGER
      },
      process_id: {
        type: Sequelize.INTEGER
      },
      spinner_id: {
        type: Sequelize.INTEGER
      },
      ginner_id: {
        type: Sequelize.INTEGER
      },
      sold_to: {
        type: Sequelize.INTEGER
      },
      test_report: {
        type: Sequelize.DATE,
      },
      lab_name: {
        type: Sequelize.STRING
      },
      sci: {
        type: Sequelize.DOUBLE
      },
      moisture: {
        type: Sequelize.DOUBLE
      },
      mic: {
        type: Sequelize.DOUBLE
      },
      mat: {
        type: Sequelize.DOUBLE
      },
      uhml: {
        type: Sequelize.DOUBLE
      },
      ui: {
        type: Sequelize.DOUBLE
      },
      sf: {
        type: Sequelize.DOUBLE
      },
      str: {
        type: Sequelize.DOUBLE
      },
      elg: {
        type: Sequelize.DOUBLE
      },
      rd: {
        type: Sequelize.DOUBLE
      },
      plusb: {
        type: Sequelize.STRING
      },
      document: {
        type: Sequelize.ARRAY(Sequelize.STRING)
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
    await queryInterface.dropTable('quality-parameters');
  }
};
