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
    await queryInterface.createTable('ics_quantity_estimations', {
      id: {
        type: Sequelize.INTEGER,
        autoIncrement: true,
        allowNull: false,
        primaryKey: true
      },
      season_id: {
        type: Sequelize.INTEGER,
        allowNull: false
      },
      farm_group_id: {
        type: Sequelize.INTEGER,
        allowNull: false
      },
      ics_id: {
        type: Sequelize.INTEGER,
        allowNull: false
      },
      no_of_farmer: {
        type: Sequelize.STRING,
        allowNull: false
      },
      total_area: {
        type: Sequelize.STRING,
        allowNull: false
      },
      est_cotton_area: {
        type: Sequelize.STRING,
        allowNull: false
      },
      estimated_lint: {
        type: Sequelize.STRING,
        allowNull: false
      },
      verified_row_cotton: {
        type: Sequelize.STRING,
        allowNull: false
      },
      verified_ginner: {
        type: Sequelize.STRING,
        allowNull: false
      },
      crop_current_season_id: {
        type: Sequelize.INTEGER,
        allowNull: false
      },
      organic_standard: {
        type: Sequelize.STRING,
        allowNull: false
      },
      certification_body: {
        type: Sequelize.STRING,
        allowNull: false
      },
      scope_issued_date: {
        type: Sequelize.STRING,
        allowNull: false
      },
      scope_certification_validity: {
        type: Sequelize.STRING,
        allowNull: false
      },
      scope_certification_no: {
        type: Sequelize.STRING,
        allowNull: false
      },
      nop_scope_certification_no: {
        type: Sequelize.STRING,
        allowNull: false
      },
      district: {
        type: Sequelize.STRING,
        allowNull: false
      },
      state: {
        type: Sequelize.STRING,
        allowNull: false
      },
      remark: {
        type: Sequelize.STRING,
        allowNull: false
      },
      createdAt: {
        allowNull: false,
        type: Sequelize.DATE
      },
      updatedAt: {
        allowNull: false,
        type: Sequelize.DATE
      }
    });
  },

  async down(queryInterface, Sequelize) {
    /**
     * Add reverting commands here.
     *
     * Example:
     * await queryInterface.dropTable('users');
     */
    await queryInterface.dropTable('ics_quantity_estimations');
  }
};
