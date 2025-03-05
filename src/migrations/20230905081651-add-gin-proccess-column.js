'use strict';

/** @type {import('sequelize-cli').Migration} */
module.exports = {
  async up(queryInterface, Sequelize) {
    return await Promise.all([
      queryInterface.addColumn('gin_process', 'qr', {
        type: Sequelize.STRING
      })
    ])
  },

  async down(queryInterface, Sequelize) {
    return await Promise.all([
      queryInterface.removeColumn('gin_process', 'qr')
    ])
  }
};
