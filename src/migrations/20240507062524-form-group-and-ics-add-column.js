'use strict';

/** @type {import('sequelize-cli').Migration} */
module.exports = {
  async up(queryInterface, Sequelize) {
    
    await queryInterface.addColumn('ics', 'season_id', {
      type: Sequelize.INTEGER,
      allowNull: false,
      defaultValue: 0,
    });

    await queryInterface.addColumn('farm_groups', 'season_id', {
      type: Sequelize.INTEGER,
      allowNull: false,
      defaultValue: 0,
    });

    await queryInterface.sequelize.query(
      'UPDATE ics SET season_id = 0 WHERE season_id IS NULL;'
    );

    await queryInterface.sequelize.query(
      'UPDATE farm_groups SET season_id = 0 WHERE season_id IS NULL;'
    );
  },

  async down(queryInterface, Sequelize) {
    await queryInterface.removeColumn('ics', 'season_id');
    await queryInterface.removeColumn('farm_groups', 'season_id');
  }
};
