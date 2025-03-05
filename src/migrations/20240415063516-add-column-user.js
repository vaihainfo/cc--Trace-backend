'use strict';

module.exports = {
  up: async (queryInterface, Sequelize) => {
    // Retrieve table information
    const tableInfo = await queryInterface.describeTable('users');

    // Check if 'otp' and 'expiry' columns exist in the table
    const columnExists = tableInfo && tableInfo.otp && tableInfo.expiry;

    // If 'otp' column does not exist, add it
    if (!columnExists || !tableInfo.otp) {
      await queryInterface.addColumn('users', 'otp', {
        type: Sequelize.STRING,
        allowNull: true,
      });
    }

    // If 'expiry' column does not exist, add it
    if (!columnExists || !tableInfo.expiry) {
      await queryInterface.addColumn('users', 'expiry', {
        type: Sequelize.DATE,
        allowNull: true,
      });
    }
  },

  down: async (queryInterface, Sequelize) => {
    await queryInterface.removeColumn('users', 'otp');
    await queryInterface.removeColumn('users', 'expiry');
  }
};
