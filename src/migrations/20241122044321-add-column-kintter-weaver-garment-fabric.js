'use strict';

/** @type {import('sequelize-cli').Migration} */
module.exports = {
  async up(queryInterface, Sequelize) {
    await queryInterface.addColumn('knit_processes', 'from_date', {
      type: Sequelize.DATE,
      defaultValue: null,
      allowNull: true
    });
    await queryInterface.addColumn('knit_processes', 'to_date', {
      type: Sequelize.DATE,
      defaultValue: null,
      allowNull: true
    });
    await queryInterface.addColumn('weaver_processes', 'from_date', {
      type: Sequelize.DATE,
      defaultValue: null,
      allowNull: true
    });
    await queryInterface.addColumn('weaver_processes', 'to_date', {
      type: Sequelize.DATE,
      defaultValue: null,
      allowNull: true
    });
    await queryInterface.addColumn('garment_processes', 'from_date', {
      type: Sequelize.DATE,
      defaultValue: null,
      allowNull: true
    });
    await queryInterface.addColumn('garment_processes', 'to_date', {
      type: Sequelize.DATE,
      defaultValue: null,
      allowNull: true
    });

    await queryInterface.addColumn('dying_sales', 'from_date', {
      type: Sequelize.DATE,
      defaultValue: null,
      allowNull: true
    });
    await queryInterface.addColumn('dying_sales', 'to_date', {
      type: Sequelize.DATE,
      defaultValue: null,
      allowNull: true
    });
    await queryInterface.addColumn('printing_sales', 'from_date', {
      type: Sequelize.DATE,
      defaultValue: null,
      allowNull: true
    });
    await queryInterface.addColumn('printing_sales', 'to_date', {
      type: Sequelize.DATE,
      defaultValue: null,
      allowNull: true
    });
    await queryInterface.addColumn('washing_sales', 'from_date', {
      type: Sequelize.DATE,
      defaultValue: null,
      allowNull: true
    });
    await queryInterface.addColumn('washing_sales', 'to_date', {
      type: Sequelize.DATE,
      defaultValue: null,
      allowNull: true
    });
    await queryInterface.addColumn('compacting_sales', 'from_date', {
      type: Sequelize.DATE,
      defaultValue: null,
      allowNull: true
    });
    await queryInterface.addColumn('compacting_sales', 'to_date', {
      type: Sequelize.DATE,
      defaultValue: null,
      allowNull: true
    });
  },

  async down(queryInterface, Sequelize) {
    /**
     * Add reverting commands here.
     *
     * Example:
     * await queryInterface.dropTable('users');
     */
  }
};
