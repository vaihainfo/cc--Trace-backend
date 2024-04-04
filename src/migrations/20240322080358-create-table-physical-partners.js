'use strict';

/** @type {import('sequelize-cli').Migration} */
module.exports = {
  async up(queryInterface, Sequelize) {
    /**
     * Add altering commands here.
     *
     * Example:
     * await queryInterface.createTable('users', { id: Sequelize.INTEGER });
     */
    await queryInterface.createTable('physical_partners', {
      id: {
        type: Sequelize.INTEGER,
        autoIncrement: true,
        allowNull: false,
        primaryKey: true
      },
      name: {
        allowNull: false,
        type: Sequelize.STRING
      },
      short_name: {
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
      district_id: {
        type: Sequelize.INTEGER
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
      mobile: {
        type: Sequelize.STRING
      },
      landline: {
        type: Sequelize.STRING
      },
      email: {
        type: Sequelize.STRING
      },
      physicalPartnerUser_id: {
        allowNull: false,
        type: Sequelize.ARRAY(Sequelize.INTEGER)
      },
      registration_document: {
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
    /**
     * Add reverting commands here.
     *
     * Example:
     * await queryInterface.dropTable('users');
     */
    await queryInterface.dropTable('physical_partners');
  }
};
