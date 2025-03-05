'use strict';
/** @type {import('sequelize-cli').Migration} */
module.exports = {
  async up(queryInterface, Sequelize) {
    await queryInterface.createTable('validation_projects', {
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
      no_of_farmers: {
        type: Sequelize.DOUBLE
      },
      cotton_purchased: {
        type: Sequelize.DOUBLE
      },
      qty_of_lint_sold: {
        type: Sequelize.INTEGER
      },
      premium_recieved: {
        allowNull: false,
        type: Sequelize.DOUBLE
      },
      premium_transfered: {
        allowNull: false,
        type: Sequelize.ARRAY(Sequelize.STRING)
      },
      premium_transfered_name: {
        type: Sequelize.ARRAY(Sequelize.STRING)
      },
      premium_transfered_cost: {
        type: Sequelize.ARRAY(Sequelize.STRING)
      },
      avg_purchase_price: {
        allowNull: false,
        type: Sequelize.DOUBLE
      },
      avg_market_price: {
        allowNull: false,
        type: Sequelize.DOUBLE
      },
      price_variance: {
        type: Sequelize.INTEGER
      },
      calculated_avg_variance: {
        allowNull: false,
        type: Sequelize.DOUBLE
      },
      premium_transfer_claim: {
        allowNull: false,
        type: Sequelize.DOUBLE
      },
      claim_variance: {
        type: Sequelize.INTEGER
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
    await queryInterface.dropTable('validation_projects');
  }
};