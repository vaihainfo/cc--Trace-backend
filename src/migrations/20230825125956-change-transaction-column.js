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

    await queryInterface.changeColumn('transactions', 'brand_id', {
      type: Sequelize.INTEGER, // Assuming your column type is INTEGER
      allowNull: true, // Change to true to allow null
    });

    // Remove the foreign key constraint
    await queryInterface.removeConstraint('transactions', 'transactions_brand_id_fkey');
  },

  async down (queryInterface, Sequelize) {
    /**
     * Add reverting commands here.
     *
     * Example:
     * await queryInterface.dropTable('users');
     */
     // Revert the changes if needed
     await queryInterface.changeColumn('transactions', 'brandId', {
      type: Sequelize.INTEGER,
      allowNull: true, // Restore to false if necessary
    });

    // Add back the foreign key constraint if needed
    await queryInterface.addConstraint('transactions', {
      fields: ['brand_id'],
      type: 'foreign key',
      name: 'transactions_brand_id_fkey',
      references: {
        table: 'brands', // Referenced table name
        field: 'id',    // Referenced field in the Brand table
      },
      onDelete: 'SET NULL',
      onUpdate: 'SET NULL',
    });
  }
};
