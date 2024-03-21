'use strict';

/** @type {import('sequelize-cli').Migration} */
module.exports = {
  async up (queryInterface, Sequelize) {
    /**
     * Add altering commands here.
     *
     * Example:
     * await queryInterface.createTable('users', { id: Sequelize.INTEGER });
     */
    await queryInterface.sequelize.query('ALTER TABLE gin_sales ALTER COLUMN invoice_file TYPE text[] USING string_to_array(invoice_file, \',\')');
    await queryInterface.sequelize.query('ALTER TABLE spin_sales ALTER COLUMN invoice_file TYPE text[] USING string_to_array(invoice_file, \',\')');
  },

  async down (queryInterface, Sequelize) {
    /**
     * Add reverting commands here.
     *
     * Example:
     * await queryInterface.dropTable('users');
     */
    await queryInterface.sequelize.query('ALTER TABLE gin_sales ALTER COLUMN invoice_file TYPE VARCHAR(255)');
    await queryInterface.sequelize.query('ALTER TABLE spin_sales ALTER COLUMN invoice_file TYPE VARCHAR(255)');
  }
};
