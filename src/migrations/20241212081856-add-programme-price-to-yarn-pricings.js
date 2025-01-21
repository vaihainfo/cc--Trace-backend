'use strict';

module.exports = {
  up: async (queryInterface, Sequelize) => {
    await queryInterface.addColumn('yarn-pricings', 'programme_price', {
      type: Sequelize.DECIMAL,
      allowNull: false,
      defaultValue: 0 // temporary default value for existing records
    });
  },

  down: async (queryInterface, Sequelize) => {
    await queryInterface.removeColumn('yarn-pricings', 'programme_price');
  }
};