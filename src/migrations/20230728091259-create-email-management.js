'use strict';
/** @type {import('sequelize-cli').Migration} */
module.exports = {
  async up(queryInterface, Sequelize) {
    await queryInterface.createTable('email_managements', {
      id: {
        allowNull: false,
        autoIncrement: true,
        primaryKey: true,
        type: Sequelize.INTEGER
      },
      template_id: {
        type: Sequelize.INTEGER,
        references: { model: 'email_templates', key: 'id' },
        onDelete: 'CASCADE',
        allowNull: false,
        foreignKey: true,
      },
      mail_type: {
        type: Sequelize.STRING
      },
      user_categories: {
        type: Sequelize.ARRAY(Sequelize.INTEGER)
      },
      program_ids: {
        type: Sequelize.ARRAY(Sequelize.INTEGER)
      },
      brand_ids: {
        type: Sequelize.ARRAY(Sequelize.INTEGER)
      },
      country_ids: {
        type: Sequelize.ARRAY(Sequelize.INTEGER)
      },
      user_ids: {
        type: Sequelize.ARRAY(Sequelize.INTEGER)
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
    await queryInterface.dropTable('email_managements');
  }
};