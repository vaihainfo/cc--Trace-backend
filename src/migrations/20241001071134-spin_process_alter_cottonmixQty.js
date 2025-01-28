'use strict';

module.exports = {
  up: async (queryInterface, Sequelize) => {
    await queryInterface.sequelize.transaction(async (transaction) => {
      // Step 1: Temporarily store the current data in a new column
      await queryInterface.addColumn('spin_processes', 'cottonmix_qty_temp', {
        type: Sequelize.ARRAY(Sequelize.DOUBLE),
        allowNull: true,
      }, { transaction });

      // Step 2: Copy data from cottonmix_qty to the new column after conversion
      await queryInterface.sequelize.query(`
        UPDATE "spin_processes"
        SET "cottonmix_qty_temp" = ARRAY(
          SELECT unnest("cottonmix_qty")::DOUBLE PRECISION
        )
      `, { transaction });

      // Step 3: Drop the original cottonmix_qty column
      await queryInterface.removeColumn('spin_processes', 'cottonmix_qty', { transaction });

      // Step 4: Rename the temporary column to the original name
      await queryInterface.renameColumn('spin_processes', 'cottonmix_qty_temp', 'cottonmix_qty', { transaction });
    });
  },

  down: async (queryInterface, Sequelize) => {
    // If you need to revert the migration, change the column back to ARRAY(INTEGER)
    await queryInterface.sequelize.transaction(async (transaction) => {
      // Step 1: Create a temporary column to store reverted data
      await queryInterface.addColumn('spin_processes', 'cottonmix_qty_temp', {
        type: Sequelize.ARRAY(Sequelize.INTEGER),
        allowNull: true,
      }, { transaction });

      // Step 2: Copy data back, converting it to integers
      await queryInterface.sequelize.query(`
        UPDATE "spin_processes"
        SET "cottonmix_qty_temp" = ARRAY(
          SELECT unnest("cottonmix_qty")::INTEGER
        )
      `, { transaction });

      // Step 3: Remove the double-precision column
      await queryInterface.removeColumn('spin_processes', 'cottonmix_qty', { transaction });

      // Step 4: Rename the temp column back to the original name
      await queryInterface.renameColumn('spin_processes', 'cottonmix_qty_temp', 'cottonmix_qty', { transaction });
    });
  },
};
