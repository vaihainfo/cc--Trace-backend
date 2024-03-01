'use strict';
/** @type {import('sequelize-cli').Migration} */
module.exports = {
  async up(queryInterface, Sequelize) {
    await queryInterface.createTable('knit_fabrics', {
      id: {
        allowNull: false,
        autoIncrement: true,
        primaryKey: true,
        type: Sequelize.INTEGER
      },
      process_id : {
        type: Sequelize.INTEGER
      },
      fabric_type: {
        type: Sequelize.INTEGER
      },
      fabric_gsm: {
        type: Sequelize.STRING
      },
      fabric_weight : {
        type: Sequelize.DOUBLE
      },
      sold_status :{
        type : Sequelize.BOOLEAN
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
    await queryInterface.dropTable('knit_fabrics');
  }
};