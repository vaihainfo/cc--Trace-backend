'use strict';
/** @type {import('sequelize-cli').Migration} */
module.exports = {
  async up(queryInterface, Sequelize) {
    await queryInterface.createTable('villages', {
      id: {
        allowNull: false,
        autoIncrement: true,
        primaryKey: true,
        type: Sequelize.INTEGER
      },
      block_id: {
        type: Sequelize.INTEGER,
        foreignKey: true,
        references: { model: 'blocks', key: 'id' },
        onDelete: 'CASCADE',
      },
      village_name: {
        type: Sequelize.STRING
      },
      village_status: {
        defaultValue: true,
        type: Sequelize.BOOLEAN
      },
      village_latitude: {
        type: Sequelize.STRING
      },
      village_longitude: {
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
    await queryInterface.dropTable('villages');
  }
};