'use strict';

module.exports = {
  async up(queryInterface, Sequelize) {
    await queryInterface.sequelize.query('ALTER TABLE spin_sales ALTER COLUMN yarn_type TYPE text[] USING string_to_array(yarn_type, \',\')');
    await queryInterface.sequelize.query('ALTER TABLE spin_sales ALTER COLUMN yarn_count TYPE integer[] USING ARRAY[yarn_count]');
  },

  async down(queryInterface, Sequelize) {
    await queryInterface.sequelize.query('ALTER TABLE spin_sales ALTER COLUMN yarn_type TYPE VARCHAR(255)');
    await queryInterface.sequelize.query('ALTER TABLE spin_sales ALTER COLUMN yarn_count TYPE DOUBLE PRECISION');
  }
};