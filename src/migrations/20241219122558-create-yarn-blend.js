'use strict';
/** @type {import('sequelize-cli').Migration} */
module.exports = {
  async up(queryInterface, Sequelize) {
    await queryInterface.createTable('yarn-blends', {
      id: {
        allowNull: false,
        autoIncrement: true,
        primaryKey: true,
        unique: true,
        type: Sequelize.INTEGER
      },
      cotton_name: {
        allowNull: false,
        type: Sequelize.STRING
      },
      cotton_percentage: {
        allowNull: false,
        type: Sequelize.DOUBLE
      },
      cotton_blend: {
        allowNull: false,
        type: Sequelize.ARRAY(Sequelize.INTEGER)
      },
      cotton_blend_percentage: {
        allowNull: false,
        type: Sequelize.ARRAY(Sequelize.DOUBLE)
      },
      brand_id: {
        allowNull: false,
        type: Sequelize.ARRAY(Sequelize.INTEGER)
      },
      status: {
        allowNull: false,
        type: Sequelize.BOOLEAN
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
    await queryInterface.dropTable('yarn-blends');
  }
};