'use strict';

/** @type {import('sequelize-cli').Migration} */
module.exports = {
  async up (queryInterface, Sequelize) {
   await queryInterface.addColumn('failed_records', 'ginner_id', {
        type: Sequelize.INTEGER,
        allowNull: true,
   });
  },

  async down (queryInterface, Sequelize) {
    await queryInterface.removeColumn('failed_records', 'ginner_id');
  }
};
