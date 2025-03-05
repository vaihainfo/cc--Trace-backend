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

    await queryInterface.sequelize.query('ALTER TABLE spin_processes ALTER COLUMN yarn_count TYPE integer[] USING ARRAY[CAST(yarn_count AS integer)]');
    await queryInterface.sequelize.query('ALTER TABLE spin_processes ALTER COLUMN yarn_qty_produced TYPE double precision[] USING ARRAY[CAST(yarn_qty_produced AS double precision)]');
  },

  async down (queryInterface, Sequelize) {
    /**
     * Add reverting commands here.
     *
     * Example:
     * await queryInterface.dropTable('users');
     */
    await queryInterface.sequelize.query('ALTER TABLE spin_processes ALTER COLUMN yarn_count TYPE double precision');
    await queryInterface.sequelize.query('ALTER TABLE spin_processes ALTER COLUMN yarn_qty_produced TYPE double precision');
  }
};
