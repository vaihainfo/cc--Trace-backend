'use strict';

/** @type {import('sequelize-cli').Migration} */
module.exports = {
  async up (queryInterface, Sequelize) {
    await queryInterface.addColumn('weaver_fabrics', 'fabric_length_stock', {
      type: Sequelize.DOUBLE
    });
    await queryInterface.sequelize.query(`
      UPDATE weaver_fabrics
      SET fabric_length_stock = CASE
        WHEN sold_status = true THEN 0
        ELSE fabric_length
      END;
    `);
  },

  async down (queryInterface, Sequelize) {
    await queryInterface.removeColumn('weaver_fabrics', 'fabric_length_stock');
    await queryInterface.sequelize.query(`
      -- Assuming there's no specific rollback action needed for this migration
    `);
  }
};
