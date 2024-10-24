'use strict';

/** @type {import('sequelize-cli').Migration} */

module.exports = {
  up: async (queryInterface, Sequelize) => {
    await queryInterface.changeColumn('gin_heaps', 'weighbridge_upload_recipt', {
      type: Sequelize.TEXT
    });
    await queryInterface.changeColumn('gin_heaps', 'weighbridge_vehicle_photo', {
      type: Sequelize.TEXT
    });
    await queryInterface.changeColumn('gin_heaps', 'upload_heap_register', {
      type: Sequelize.TEXT
    });
  },

  down: async (queryInterface, Sequelize) => {
    await queryInterface.changeColumn('gin_heaps', 'weighbridge_upload_recipt', {
      type: Sequelize.STRING(255)
    });
    await queryInterface.changeColumn('gin_heaps', 'weighbridge_vehicle_photo', {
      type: Sequelize.STRING(255)
    });
    await queryInterface.changeColumn('gin_heaps', 'upload_heap_register', {
      type: Sequelize.STRING(255)
    });
  }
};
