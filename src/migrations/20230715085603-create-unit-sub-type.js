'use strict';
/** @type {import('sequelize-cli').Migration} */
module.exports = {
  async up(queryInterface, Sequelize) {
    await queryInterface.createTable('unit_subtypes', {
      id: {
        allowNull: false,
        autoIncrement: true,
        primaryKey: true,
        type: Sequelize.INTEGER
      },
      unitType_id: {
        type: Sequelize.INTEGER,
        foreignKey: true,
        references: { model: 'unit_types', key: 'id' },
        onDelete: 'CASCADE',
      },
      unitSubType: {
        allowNull: false,
        type: Sequelize.STRING
      },
      unitSubType_status: {
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
    await queryInterface.dropTable('unit_subTypes');
  }
};