'use strict';
/** @type {import('sequelize-cli').Migration} */
module.exports = {
  async up(queryInterface, Sequelize) {
    await queryInterface.createTable('crop_grades', {
      id: {
        allowNull: false,
        autoIncrement: true,
        primaryKey: true,
        type: Sequelize.INTEGER
      },
      cropVariety_id: {
        type: Sequelize.INTEGER,
        foreignKey: true,
        references: { model: 'crop_varieties', key: 'id' },
        onDelete: 'CASCADE',
      },
      cropGrade: {
        allowNull: false,
        type: Sequelize.STRING
      },
      cropGrade_status: {
        allowNull: false,
        defaultValue: true,
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
    await queryInterface.dropTable('crop_grades');
  }
};