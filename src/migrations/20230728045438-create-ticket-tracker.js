'use strict';
/** @type {import('sequelize-cli').Migration} */
module.exports = {
  async up(queryInterface, Sequelize) {
    await queryInterface.createTable('ticket_trackers', {
      id: {
        allowNull: false,
        autoIncrement: true,
        primaryKey: true,
        type: Sequelize.INTEGER
      },
      ticket_no: {
        type: Sequelize.BIGINT
      },
      date: {
        type: Sequelize.DATE
      },
      processor_name: {
        type: Sequelize.STRING
      },
      processor_type: {
        type: Sequelize.STRING
      },
      ticket_type: {
        type: Sequelize.STRING
      },
      process_or_sales: {
        type: Sequelize.STRING
      },
      style_mark_no: {
        type: Sequelize.STRING
      },
      comments: {
        type: Sequelize.TEXT
      },
      documents: {
        type: Sequelize.STRING
      },
      status: {
        type: Sequelize.STRING
      },
      resolved_date: {
        type: Sequelize.DATE
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
    await queryInterface.dropTable('ticket_trackers');
  }
};