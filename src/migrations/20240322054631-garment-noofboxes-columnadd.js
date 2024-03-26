'use strict';

/** @type {import('sequelize-cli').Migration} */
module.exports = {
  async up (queryInterface, Sequelize) {
    await queryInterface.addColumn('garment_fabric_types', 'no_of_pieces_stock', {
      type: Sequelize.DOUBLE
    });
    await queryInterface.sequelize.query(`
      UPDATE garment_fabric_types
      SET no_of_pieces_stock = CASE
        WHEN sold_status = true THEN 0
        ELSE no_of_pieces
      END;
    `);
  },

  async down (queryInterface, Sequelize) {
    await queryInterface.removeColumn('garment_fabric_types', 'no_of_pieces_stock');
    await queryInterface.sequelize.query(`
      -- Assuming there's no specific rollback action needed for this migration
    `);
  }
};
