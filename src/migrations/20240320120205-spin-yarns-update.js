'use strict';

/** @type {import('sequelize-cli').Migration} */
module.exports = {
  async up (queryInterface, Sequelize) {
    await queryInterface.addColumn('spin_yarns', 'yarn_qty_stock', {
      type: Sequelize.DOUBLE
    });
    await queryInterface.sequelize.query(`
    UPDATE spin_yarns
    SET yarn_qty_stock = CASE
      WHEN sold_status = true THEN 0
      ELSE yarn_produced
    END;
  `);
  },

  async down (queryInterface, Sequelize) {
    await queryInterface.removeColumn('spin_yarns', 'yarn_qty_stock');
    await queryInterface.sequelize.query(`
    -- Assuming there's no specific rollback action needed for this migration
  `);
  }
};
