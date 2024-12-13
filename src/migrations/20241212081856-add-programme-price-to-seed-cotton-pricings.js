'use strict';

module.exports = {
  up: async (queryInterface, Sequelize) => {
    await queryInterface.addColumn('seed-cotton-pricings', 'programme_price', {
      type: Sequelize.DECIMAL,
      allowNull: false,
      defaultValue: 0 // temporary default value for existing records
    });
  },

  down: async (queryInterface, Sequelize) => {
    await queryInterface.removeColumn('seed-cotton-pricings', 'programme_price');
  }
};