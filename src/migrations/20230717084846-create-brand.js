'use strict';
/** @type {import('sequelize-cli').Migration} */
module.exports = {
  async up(queryInterface, Sequelize) {
    await queryInterface.createTable('brands', {
      id: {
        allowNull: false,
        autoIncrement: true,
        primaryKey: true,
        type: Sequelize.INTEGER
      },
      brand_name: {
        allowNull: false,
        type: Sequelize.STRING
      },
      address: {
        allowNull: false,
        type: Sequelize.STRING
      },
      email: {
        type: Sequelize.STRING
      },
      programs_id: {
        allowNull: false,
        type: Sequelize.ARRAY(Sequelize.INTEGER)
      },
      countries_id: {
        allowNull: false,
        type: Sequelize.ARRAY(Sequelize.INTEGER)
      },
      website: {
        type: Sequelize.STRING
      },
      company_info: {
        type: Sequelize.STRING
      },
      contact_person: {
        allowNull: false,
        type: Sequelize.STRING
      },
      logo: {
        type: Sequelize.STRING
      },
      photo: {
        type: Sequelize.STRING
      },
      mobile: {
        type: Sequelize.STRING
      },
      landline: {
        type: Sequelize.STRING
      },
      brandUser_id: {
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
    await queryInterface.dropTable('brands');
  }
};