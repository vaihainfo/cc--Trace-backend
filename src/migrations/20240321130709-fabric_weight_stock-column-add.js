'use strict';

/** @type {import('sequelize-cli').Migration} */
module.exports = {
  async up (queryInterface, Sequelize) {
    await queryInterface.addColumn('knit_fabrics', 'fabric_weight_stock', {
      type: Sequelize.DOUBLE
    });
    await queryInterface.sequelize.query(`
      UPDATE knit_fabrics
      SET fabric_weight_stock = CASE
        WHEN sold_status = true THEN 0
        ELSE fabric_weight
      END;
    `);
  },

  async down (queryInterface, Sequelize) {
    await queryInterface.removeColumn('knit_fabrics', 'fabric_weight_stock');
    await queryInterface.sequelize.query(`
      -- Assuming there's no specific rollback action needed for this migration
    `);
  }
};