'use strict';

/** @type {import('sequelize-cli').Migration} */
module.exports = {
  async up (queryInterface, Sequelize) {
    await queryInterface.addColumn('gin_sales', 'approval_doc', {
      type: Sequelize.ARRAY(Sequelize.TEXT),
      allowNull: true, // or false if the column is required
      defaultValue: null, // Default value (optional)
    });
  },
  async down (queryInterface, Sequelize) {
    await queryInterface.removeColumn('gin_sales', 'approval_doc');
  }
};
console.log('Running migration for adding status column to gin_sales approval_doc table');
