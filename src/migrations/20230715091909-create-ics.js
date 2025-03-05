'use strict';
/** @type {import('sequelize-cli').Migration} */
module.exports = {
  async up(queryInterface, Sequelize) {
    await queryInterface.createTable('ics', {
      id: {
        allowNull: false,
        autoIncrement: true,
        primaryKey: true,
        type: Sequelize.INTEGER
      },
      ics_name: {
        allowNull: false,
        type: Sequelize.STRING
      },
      farmGroup_id: {
        type: Sequelize.INTEGER,
        foreignKey: true,
        references: { model: 'farm_groups', key: 'id' },
        onDelete: 'CASCADE',
      },
      ics_latitude: {
        type: Sequelize.STRING
      },
      ics_longitude: {
        type: Sequelize.STRING
      },
      ics_status: {
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
    await queryInterface.dropTable('ics');
  }
};