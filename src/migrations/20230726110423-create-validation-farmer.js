'use strict';
/** @type {import('sequelize-cli').Migration} */
module.exports = {
  async up(queryInterface, Sequelize) {
    await queryInterface.createTable('validation_farmers', {
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
      season_id: {
        allowNull: false,
        type: Sequelize.INTEGER
      },
      brand_id: {
        allowNull: false,
        type: Sequelize.INTEGER
      },
      farmGroup_id: {
        allowNull: false,
        type: Sequelize.INTEGER
      },
      ics_id: {
        allowNull: false,
        type: Sequelize.INTEGER
      },
      farmer_id: {
        allowNull: false,
        type: Sequelize.INTEGER
      },
      farmer_image: {
        allowNull: false,
        type: Sequelize.STRING
      },
      valid_identity: {
        allowNull: false,
        type: Sequelize.STRING
      },
      identity_others: {
        type: Sequelize.STRING
      },
      identity_id: {
        allowNull: false,
        type: Sequelize.STRING
      },
      identity_image: {
        type: Sequelize.STRING
      },
      cotton_purchaser:{
        allowNull: false,
        type: Sequelize.STRING
      },
      market_rate: {
        allowNull: false,
        type: Sequelize.STRING
      },
      payment_mode: {
        allowNull: false,
        type: Sequelize.STRING
      },
      payment_proof: {
        allowNull: false,
        type: Sequelize.BOOLEAN
      },
      proof_name: {
        type: Sequelize.STRING
      },
      proof_document: {
        type: Sequelize.STRING
      },
      is_ginner_supported: {
        allowNull: false,
        type: Sequelize.BOOLEAN
      },
      ginner_supported_details: {
        type: Sequelize.ARRAY(Sequelize.STRING)
      },
      ginner_supported_others: {
        type: Sequelize.ARRAY(Sequelize.STRING)
      },
      support_mode: {
        allowNull: false,
        type: Sequelize.ARRAY(Sequelize.STRING)
      },
      verifier_inference: {
        allowNull: false,
        type: Sequelize.STRING
      },
      partially_verified: {
        type: Sequelize.TEXT
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
    await queryInterface.dropTable('validation_farmers');
  }
};