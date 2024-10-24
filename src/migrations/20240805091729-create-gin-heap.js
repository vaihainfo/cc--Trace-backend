'use strict';

/** @type {import('sequelize-cli').Migration} */
module.exports = {
  async up (queryInterface, Sequelize) {
    await queryInterface.createTable('gin_heaps', {
      id: {
        type: Sequelize.INTEGER,
        autoIncrement: true,
        allowNull: false,
        primaryKey: true
      },
      ginner_id: {
        type: Sequelize.INTEGER,
        foreignKey: true,
        references: { model: 'ginners', key: 'id' },
        onDelete: 'CASCADE',
        allowNull: false,
      },
      season_id: {
        allowNull: false,
        type: Sequelize.INTEGER
      },
      program_id: {
        allowNull: false,
        type: Sequelize.INTEGER
      },
      heap_starting_date: {
        allowNull: false,
        type: Sequelize.DATE
      },
      from_date: {
        allowNull: false,
        type: Sequelize.DATE
      },
      to_date: {
        allowNull: false,
        type: Sequelize.DATE
      },
      heap_ending_date: {
        allowNull: false,
        type: Sequelize.DATE
      },
      ginner_heap_no: {
        allowNull: false,
        type: Sequelize.STRING
      },
      reel_heap_no: {
        allowNull: false,
        type: Sequelize.STRING
      },
      upload_heap_register: {
        type: Sequelize.STRING
      },
       weighbridge_village: {
        type: Sequelize.STRING
      },
       weighbridge_vehicle_no: {
        type: Sequelize.STRING
      },
       weighbridge_upload_recipt: {
        type: Sequelize.STRING
      },
       weighbridge_vehicle_photo: {
        type: Sequelize.STRING
      },
      estimated_heap: {
        type: Sequelize.DOUBLE
      },
      qty_stock: {
        type: Sequelize.DOUBLE
      },
      status: {
        allowNull: false,
        type: Sequelize.BOOLEAN,
        defaultValue: false
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

    await queryInterface.addColumn('cotton_selections', 'heap_id', {
      type: Sequelize.INTEGER,
      defaultValue: null
    });
  },

  async down (queryInterface, Sequelize) {
    await queryInterface.removeColumn('cotton_selections', 'heap_id');
    await queryInterface.dropTable('gin_heaps');
  }
};
