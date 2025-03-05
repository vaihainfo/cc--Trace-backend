'use strict';
/** @type {import('sequelize-cli').Migration} */
module.exports = {
  async up(queryInterface, Sequelize) {
    await queryInterface.createTable('organic_integrities', {
      id: {
        allowNull: false,
        autoIncrement: true,
        primaryKey: true,
        type: Sequelize.INTEGER
      },
      date: {
        allowNull: false,
        type: Sequelize.DATE
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
      test_stage: {
        allowNull: false,
        type: Sequelize.STRING
      },
      farmer: {
        allowNull: false,
        type: Sequelize.STRING
      },
      seal_no: {
        type: Sequelize.STRING
      },
      sample_code: {
        type: Sequelize.STRING
      },
      seed_lot: {
        type: Sequelize.STRING
      },
      integrity_score: {
        allowNull: false,
        type: Sequelize.BOOLEAN
      },
      documents: {
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
    await queryInterface.dropTable('organic_integrities');
  }
};