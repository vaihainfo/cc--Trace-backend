'use strict';
/** @type {import('sequelize-cli').Migration} */
module.exports = {
  async up(queryInterface, Sequelize) {
    await queryInterface.createTable('traders', {
      id: {
        allowNull: false,
        autoIncrement: true,
        primaryKey: true,
        type: Sequelize.INTEGER
      },
      name: {
        allowNull: false,
        type: Sequelize.STRING
      },
      address: {
        allowNull: false,
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
      program_id: {
        allowNull: false,
        type: Sequelize.ARRAY(Sequelize.INTEGER)
      },
      latitude: {
        type: Sequelize.STRING
      },
      longitude: {
        type: Sequelize.STRING
      },
      website: {
        type: Sequelize.STRING
      },
      contact_person: {
        allowNull: false,
        type: Sequelize.STRING
      },
      unit_cert: {
        type: Sequelize.ARRAY(Sequelize.INTEGER)
      },
      company_info: {
        type: Sequelize.STRING
      },
      org_logo: {
        type: Sequelize.STRING
      },
      org_photo: {
        type: Sequelize.STRING
      },
      certs: {
        type: Sequelize.STRING
      },
      brand: {
        allowNull: false,
        type: Sequelize.ARRAY(Sequelize.INTEGER)
      },
      material_trading: {
        allowNull: false,
        type: Sequelize.ARRAY(Sequelize.STRING)
      },
      mobile: {
        type: Sequelize.STRING
      },
      landline: {
        type: Sequelize.STRING
      },
      email: {
        type: Sequelize.STRING
      },
      traderUser_id: {
        allowNull: false,
        type: Sequelize.ARRAY(Sequelize.INTEGER)
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
    await queryInterface.dropTable('traders');
  }
};