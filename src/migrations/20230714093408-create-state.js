'use strict';
/** @type {import('sequelize-cli').Migration} */
module.exports = {
  async up(queryInterface, Sequelize) {
    await queryInterface.createTable('states', {
      id: {
        allowNull: false,
        autoIncrement: true,
        primaryKey: true,
        type: Sequelize.INTEGER
      },
      country_id: {
        type: Sequelize.INTEGER,
        foreignKey: true,
        references: { model: 'countries', key: 'id' },
        onDelete: 'CASCADE',
      },
      state_name: {
        type: Sequelize.STRING
      },
      state_status: {
        defaultValue: true,
        type: Sequelize.BOOLEAN
      },
      state_latitude: {
        type: Sequelize.STRING
      },
      state_longitude: {
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
    await queryInterface.dropTable('states');
  }
};