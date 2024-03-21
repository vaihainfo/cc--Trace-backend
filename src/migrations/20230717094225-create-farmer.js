'use strict';
/** @type {import('sequelize-cli').Migration} */
module.exports = {
  async up(queryInterface, Sequelize) {
    await queryInterface.createTable('farmers', {
      id: {
        allowNull: false,
        autoIncrement: true,
        primaryKey: true,
        type: Sequelize.INTEGER
      },
      program_id: {
        type: Sequelize.INTEGER,
        foreignKey: true,
        references: { model: 'programs', key: 'id' },
        onDelete: 'CASCADE',
      },
      brand_id: {
        type: Sequelize.INTEGER,
        foreignKey: true,
        references: { model: 'brands', key: 'id' },
        onDelete: 'CASCADE',
      },
      farmGroup_id: {
        type: Sequelize.INTEGER,
        foreignKey: true,
        references: { model: 'farm_groups', key: 'id' },
        onDelete: 'CASCADE',
      },
      firstName: {
        type: Sequelize.STRING
      },
      middleName: {
        type: Sequelize.STRING
      },
      lastName: {
        type: Sequelize.STRING
      },
      code: {
        type: Sequelize.STRING
      },
      fatherName: {
        type: Sequelize.STRING
      },
      gender: {
        type: Sequelize.STRING
      },
      marital_status: {
        type: Sequelize.STRING
      },
      mobile: {
        type: Sequelize.STRING
      },
      phone: {
        type: Sequelize.STRING
      },
      age: {
        type: Sequelize.STRING
      },
      qualification: {
        type: Sequelize.STRING
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
      district_id: {
        type: Sequelize.INTEGER,
        foreignKey: true,
        references: { model: 'districts', key: 'id' },
        onDelete: 'CASCADE',
        allowNull: false,
      },
      block_id: {
        type: Sequelize.INTEGER,
        foreignKey: true,
        references: { model: 'blocks', key: 'id' },
        onDelete: 'CASCADE',
        allowNull: false,
      },
      village_id: {
        type: Sequelize.INTEGER,
        foreignKey: true,
        references: { model: 'villages', key: 'id' },
        onDelete: 'CASCADE',
      },
      image: {
        type: Sequelize.STRING
      },
      soilType: {
        type: Sequelize.STRING
      },
      soilTexture: {
        type: Sequelize.STRING
      },
      irrigationSource: {
        type: Sequelize.STRING
      },
      no_of_family_members: {
        type: Sequelize.INTEGER
      },
      no_of_adults: {
        type: Sequelize.INTEGER
      },
      no_of_children: {
        type: Sequelize.INTEGER
      },
      joining_date: {
        type: Sequelize.DATE
      },
      ics_id: {
        type: Sequelize.INTEGER
      },
      tracenet_id: {
        type: Sequelize.INTEGER
      },
      cert_status: {
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
    await queryInterface.dropTable('farmers');
  }
};