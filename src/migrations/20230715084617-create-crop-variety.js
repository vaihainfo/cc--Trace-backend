'use strict';
/** @type {import('sequelize-cli').Migration} */
module.exports = {
  async up(queryInterface, Sequelize) {
    await queryInterface.createTable('crop_varieties', {
      id: {
        allowNull: false,
        autoIncrement: true,
        primaryKey: true,
        type: Sequelize.INTEGER
      },
      cropType_id: {
        type: Sequelize.INTEGER,
        foreignKey: true,
        references: { model: 'crop_types', key: 'id' },
        onDelete: 'CASCADE',
      },
      cropVariety: {
        allowNull: false,
        type: Sequelize.STRING
      },
      cropVariety_status: {
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
    await queryInterface.dropTable('crop_varieties');
  }
};