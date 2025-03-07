'use strict';

/** @type {import('sequelize-cli').Migration} */
module.exports = {
  async up (queryInterface, Sequelize) {
    await queryInterface.addColumn('spin_yarns', 'batch_lot_no', {
      type: Sequelize.STRING,
    });

    await queryInterface.changeColumn('spin_processes', 'batch_lot_no', {
      type: Sequelize.TEXT,
    });
  },

  async down (queryInterface, Sequelize) {
    await queryInterface.changeColumn('spin_processes', 'batch_lot_no', {
      type: Sequelize.STRING,
    });
    await queryInterface.removeColumn('spin_yarns', 'batch_lot_no');
  }
};
