'use strict';
/** @type {import('sequelize-cli').Migration} */
module.exports = {
  async up(queryInterface, Sequelize) {
    await queryInterface.createTable('supply_chain_managers', {
      id: {
        allowNull: false,
        autoIncrement: true,
        primaryKey: true,
        type: Sequelize.INTEGER
      },
      name: {
        allowNull: false,
        type: Sequelize.TEXT
      },
      program_id: {
        allowNull: false,
        type: Sequelize.ARRAY(Sequelize.INTEGER)
      },
      brand: {
        allowNull: false,
        type: Sequelize.ARRAY(Sequelize.INTEGER)
      },
      country_id: {
        allowNull: false,
        type: Sequelize.INTEGER
      },
      mapped_states: {
        type: Sequelize.ARRAY(Sequelize.INTEGER)
      },
      mapped_ginners: {
        type: Sequelize.ARRAY(Sequelize.INTEGER)
      },
      mapped_spinners: {
        type: Sequelize.ARRAY(Sequelize.INTEGER)
      },
      mapped_to: {
        type: Sequelize.STRING
      },
      email: {
        type: Sequelize.STRING
      },
      mobile: {
        type: Sequelize.STRING
      },
      scmUser_id: {
        type: Sequelize.ARRAY(Sequelize.INTEGER)
      },
      status: {
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
    await queryInterface.dropTable('supply_chain_managers');
  }
};