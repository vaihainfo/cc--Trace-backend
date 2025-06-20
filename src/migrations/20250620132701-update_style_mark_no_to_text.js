'use strict';

module.exports = {
  up: async (queryInterface, Sequelize) => {
    await queryInterface.changeColumn('ticket_trackers', 'style_mark_no', {
      type: Sequelize.TEXT
    });
  },

  down: async (queryInterface, Sequelize) => {
    await queryInterface.changeColumn('ticket_trackers', 'style_mark_no', {
      type: Sequelize.STRING
    });
  }
};