'use strict';
/** @type {import('sequelize-cli').Migration} */
module.exports = {
  async up(queryInterface, Sequelize) {
    await queryInterface.createTable('scope_certs', {
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
        allowNull: false,
      },
      state_id: {
        type: Sequelize.INTEGER,
        foreignKey: true,
        references: { model: 'states', key: 'id' },
        onDelete: 'CASCADE',
        allowNull: false,
      },
      brand_id: {
        type: Sequelize.INTEGER,
        foreignKey: true,
        references: { model: 'brands', key: 'id' },
        onDelete: 'CASCADE',
        allowNull: false,
      },
      farmGroup_id: {
        type: Sequelize.INTEGER,
        foreignKey: true,
        references: { model: 'farm_groups', key: 'id' },
        onDelete: 'CASCADE',
        allowNull: false,
      },
      ics_id: {
        type: Sequelize.INTEGER,
        foreignKey: true,
        references: { model: 'ics', key: 'id' },
        onDelete: 'CASCADE',
        allowNull: false,
      },
      validity_end: {
        allowNull: false,
        type: Sequelize.DATE
      },
      standard: {
        type: Sequelize.STRING
      },
      document: {
        allowNull: false,
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
    await queryInterface.dropTable('scope_certs');
  }
};