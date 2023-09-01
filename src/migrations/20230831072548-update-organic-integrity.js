'use strict';

/** @type {import('sequelize-cli').Migration} */
module.exports = {
  async up(queryInterface, Sequelize) {
    await Promise.all([
      queryInterface.addColumn('organic_integrities', 'ginner_id', {
        type: Sequelize.INTEGER,
        allowNull: true,
      }),
      queryInterface.removeColumn('organic_integrities', 'farmGroup_id'),
      queryInterface.removeColumn('organic_integrities', 'ics_id'),
      queryInterface.removeColumn('organic_integrities', 'farmer')
    ])

    return await Promise.all([
      queryInterface.addColumn('organic_integrities', 'farmGroup_id', {
        type: Sequelize.INTEGER
      }),
      queryInterface.addColumn('organic_integrities', 'ics_id', {
        type: Sequelize.INTEGER
      }),
      queryInterface.addColumn('organic_integrities', 'farmer', {
        type: Sequelize.INTEGER
      })
    ])
  },

  async down(queryInterface, Sequelize) {
    return Promise.all([
      queryInterface.removeColumn('organic_integrities', 'ginner_id')
    ])
  }
};
