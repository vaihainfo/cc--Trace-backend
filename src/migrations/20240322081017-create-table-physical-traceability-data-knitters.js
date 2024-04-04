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
    await queryInterface.createTable('physical_traceability_data_knitters', {
      id: {
        type: Sequelize.INTEGER,
        autoIncrement: true,
        allowNull: false,
        primaryKey: true
      },
      dna_marker_lot: {
        type: Sequelize.STRING,
        allowNull: true,
        defaultValue: null
      },
      date_sample_collection: {
        type: Sequelize.DATE,
        allowNull: false
      },
      data_of_sample_dispatch: {
        type: Sequelize.STRING,
        allowNull: false
      },
      operator_name: {
        type: Sequelize.STRING,
        allowNull: false
      },
      expected_date_of_fabric_sale: {
        type: Sequelize.DATE,
        allowNull: false
      },
      physical_traceability_partner_id: {
        type: Sequelize.INTEGER,
        foreignKey: true,
        references: { model: 'physical_partners', key: 'id' },
        onDelete: 'CASCADE',
        allowNull: false
      },
      knit_process_id: {
        type: Sequelize.INTEGER,
        foreignKey: true,
        references: { model: 'knit_processes', key: 'id' },
        onDelete: 'CASCADE',
        allowNull: false
      },
      knitter_id: {
        type: Sequelize.INTEGER,
        foreignKey: true,
        references: { model: 'knitters', key: 'id' },
        onDelete: 'CASCADE',
        allowNull: false
      },
      upload_report: {
        type: Sequelize.ARRAY(Sequelize.STRING),
        allowNull: true,
        defaultValue: null
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
    await queryInterface.dropTable('physical_traceability_data_knitters');
  }
};
