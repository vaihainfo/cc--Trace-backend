'use strict';
/** @type {import('sequelize-cli').Migration} */
module.exports = {
  async up(queryInterface, Sequelize) {
    await queryInterface.createTable('user_privileges', {
      id: {
        allowNull: false,
        autoIncrement: true,
        primaryKey: true,
        type: Sequelize.INTEGER
      },
      userRole_id: {
        type: Sequelize.INTEGER,
        foreignKey: true,
        references: { model: 'user_roles', key: 'id' },
        onDelete: 'CASCADE',
        allowNull: false,
      },
      menu_id: {
        type: Sequelize.INTEGER,
        foreignKey: true,
        references: { model: 'menu_lists', key: 'id' },
        onDelete: 'CASCADE',
        allowNull: false,
      },
      create_privilege: {
        allowNull: false,
        type: Sequelize.BOOLEAN
      },
      edit_privilege: {
        allowNull: false,
        type: Sequelize.BOOLEAN
      },
      view_privilege: {
        allowNull: false,
        type: Sequelize.BOOLEAN
      },
      delete_privilege: {
        allowNull: false,
        type: Sequelize.BOOLEAN
      },
      status: {
        type: Sequelize.BOOLEAN
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
    await queryInterface.dropTable('user_privileges');
  }
};