'use strict';

/** @type {import('sequelize-cli').Migration} */
module.exports = {
  async up(queryInterface, Sequelize) {
    return await Promise.all([
      queryInterface.addColumn('ticket_trackers', 'process_id', {
        type: Sequelize.INTEGER
      })
    ])
  },

  async down(queryInterface, Sequelize) {
    return await Promise.all([
      queryInterface.removeColumn('ticket_trackers', 'process_id')
    ])
  }
};
