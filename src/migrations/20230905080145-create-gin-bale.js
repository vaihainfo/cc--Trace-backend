'use strict';
/** @type {import('sequelize-cli').Migration} */
module.exports = {
  async up(queryInterface, Sequelize) {
    await queryInterface.createTable('gin-bales', {
      id: {
        allowNull: false,
        autoIncrement: true,
        primaryKey: true,
        type: Sequelize.INTEGER
      },
      process_id: {
        type: Sequelize.INTEGER,
        allowNull: false
      },
      bale_no: {
        type: Sequelize.STRING
      },
      weight: {
        type: Sequelize.STRING
      },
      staple: {
        type: Sequelize.STRING
      },
      mic: {
        type: Sequelize.STRING
      },
      strength: {
        type: Sequelize.STRING
      },
      trash: {
        type: Sequelize.STRING
      },
      color_grade: {
        type: Sequelize.STRING
      },
      qr: {
        type: Sequelize.STRING
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
    await queryInterface.dropTable('gin-bales');
  }
};