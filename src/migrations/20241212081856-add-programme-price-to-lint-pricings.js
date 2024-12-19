'use strict';

module.exports = {
  up: async (queryInterface, Sequelize) => {
    await queryInterface.addColumn('lint-pricings', 'programme_price', {
      type: Sequelize.DECIMAL,
      allowNull: false,
      defaultValue: 0 // temporary default value for existing records
    });
  },

  down: async (queryInterface, Sequelize) => {
    await queryInterface.removeColumn('lint-pricings', 'programme_price');
  }
};