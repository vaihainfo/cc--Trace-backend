'use strict';

/** @type {import('sequelize-cli').Migration} */

module.exports = {
  up: async (queryInterface, Sequelize) => {
    await queryInterface.changeColumn('gin_heaps', 'weighbridge_village', {
      type: Sequelize.TEXT
    });
    await queryInterface.changeColumn('gin_heaps', 'weighbridge_vehicle_no', {
      type: Sequelize.TEXT
    });
  },

  down: async (queryInterface, Sequelize) => {
    await queryInterface.changeColumn('gin_heaps', 'weighbridge_village', {
      type: Sequelize.STRING(255)
    });
    await queryInterface.changeColumn('gin_heaps', 'weighbridge_vehicle_no', {
      type: Sequelize.STRING(255)
    });
  }
};
