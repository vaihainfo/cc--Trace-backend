'use strict';

/** @type {import('sequelize-cli').Migration} */
module.exports = {
  async up(queryInterface, Sequelize) {
    await queryInterface.addColumn('spinner_yarn_orders', 'agent_details', {
      type: Sequelize.STRING,
      allowNull: true,
      after: 'process_id'
    });
  },

  async down(queryInterface, Sequelize) {
    await queryInterface.removeColumn('spinner_yarn_orders', 'agent_details');
  }
};