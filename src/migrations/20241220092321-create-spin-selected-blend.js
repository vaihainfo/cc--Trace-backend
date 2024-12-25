'use strict';
/** @type {import('sequelize-cli').Migration} */
module.exports = {
  async up(queryInterface, Sequelize) {
    await queryInterface.createTable('spin_selected_blends', {
      id: {
        allowNull: false,
        autoIncrement: true,
        primaryKey: true,
        type: Sequelize.INTEGER
      },
      process_id: {
        allowNull: false,
        type: Sequelize.INTEGER
      },
      brand_ids: {
        allowNull: false,
        type: Sequelize.ARRAY(Sequelize.INTEGER)
      },
      yarn_blend_id: {
        allowNull: false,
        type: Sequelize.INTEGER
      },
      cotton_mix_id: {
        allowNull: false,
        type: Sequelize.INTEGER
      },
      cotton_mix_qty: {
        allowNull: false,
        type: Sequelize.DOUBLE
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
    await queryInterface.dropTable('spin_selected_blends');
  }
};