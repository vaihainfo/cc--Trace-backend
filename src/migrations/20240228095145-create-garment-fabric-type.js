'use strict';
/** @type {import('sequelize-cli').Migration} */
module.exports = {
  async up(queryInterface, Sequelize) {
    await queryInterface.createTable('garment_fabric_types', {
      id: {
        allowNull: false,
        autoIncrement: true,
        primaryKey: true,
        type: Sequelize.INTEGER
      },
      process_id : {
        type: Sequelize.INTEGER
      },
      garment_type: {
        type: Sequelize.STRING
      },
      style_mark_no: {
        type: Sequelize.STRING
      },
      garment_size: {
        type: Sequelize.STRING
      },
      no_of_boxes: {
        type: Sequelize.DOUBLE
      },
      color: {
        type:  Sequelize.STRING
      },
      no_of_pieces: {
        type:  Sequelize.DOUBLE
      },
      finished_garment_image: {
        type: Sequelize.STRING
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
    await queryInterface.dropTable('garment_fabric_types');
  }
};