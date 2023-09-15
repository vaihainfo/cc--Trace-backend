'use strict';

/** @type {import('sequelize-cli').Migration} */
module.exports = {
  async up(queryInterface, Sequelize) {
    /**
     * Add altering commands here.
     *
     * Example:
     * await queryInterface.createTable('users', { id: Sequelize.INTEGER });
     */
    await Promise.all([
      queryInterface.dropTable('farms')
    ])

    return await Promise.all([
      queryInterface.createTable('farms', {
        id: {
          type: Sequelize.INTEGER,
          autoIncrement: true,
          allowNull: false,
          primaryKey: true
        },
        farmer_id: {
          type: Sequelize.INTEGER,
          foreignKey: true,
          references: { model: 'farmers', key: 'id' },
          onDelete: 'CASCADE',
          allowNull: false,
        },
        season_id: {
          type: Sequelize.INTEGER,
          allowNull: false,
          foreignKey: true,
          references: { model: 'seasons', key: 'id' },
          onDelete: 'CASCADE'
        },
        program_id: {
          allowNull: false,
          foreignKey: true,
          references: { model: 'programs', key: 'id' },
          onDelete: 'CASCADE',
          type: Sequelize.INTEGER
        },
        agri_total_area: {
          type: Sequelize.DECIMAL
        },
        agri_estimated_yeld: {
          type: Sequelize.DECIMAL
        },
        agri_estimated_prod: {
          type: Sequelize.DECIMAL
        },
        cotton_total_area: {
          type: Sequelize.DECIMAL
        },
        total_estimated_cotton: {
          type: Sequelize.DECIMAL
        },
        createdAt: {
          allowNull: false,
          type: Sequelize.DATE
        },
        updatedAt: {
          allowNull: false,
          type: Sequelize.DATE
        }
      }),
      queryInterface.addColumn('farmers', 'agri_total_area', {
        type: Sequelize.DECIMAL
      }),
      queryInterface.addColumn('farmers', 'agri_estimated_yeld', {
        type: Sequelize.DECIMAL
      }),
      queryInterface.addColumn('farmers', 'agri_estimated_prod', {
        type: Sequelize.DECIMAL
      }),
      queryInterface.addColumn('farmers', 'cotton_total_area', {
        type: Sequelize.DECIMAL
      }),
      queryInterface.addColumn('farmers', 'total_estimated_cotton', {
        type: Sequelize.DECIMAL
      })
    ])
  },

  async down(queryInterface, Sequelize) {
    /**
     * Add reverting commands here.
     *
     * Example:
     * await queryInterface.dropTable('users');
     */
    return await Promise.all([
      queryInterface.dropTable('farms'),
      queryInterface.removeColumn('farmers', 'agri_total_area', {
        type: Sequelize.DECIMAL
      }),
      queryInterface.removeColumn('farmers', 'agri_estimated_yeld', {
        type: Sequelize.DECIMAL
      }),
      queryInterface.removeColumn('farmers', 'agri_estimated_prod', {
        type: Sequelize.DECIMAL
      }),
      queryInterface.removeColumn('farmers', 'cotton_total_area', {
        type: Sequelize.DECIMAL
      }),
      queryInterface.removeColumn('farmers', 'total_estimated_cotton', {
        type: Sequelize.DECIMAL
      })
    ])
  }
};
