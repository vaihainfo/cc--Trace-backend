'use strict';

/** @type {import('sequelize-cli').Migration} */
module.exports = {
  async up(queryInterface, Sequelize) {
    // Array of all tables that need sequences
    const tables = ['spinner', 'knitter', 'weaver', 'garment', 'fabric'];

    for (const table of tables) {
      const tableName = `${table}s`;
      const seqName = `${table}_seq`;

      // Create sequence
      await queryInterface.sequelize.query(`
        CREATE SEQUENCE IF NOT EXISTS ${seqName} START 1;
      `);

      // Add sequence_no column
      await queryInterface.sequelize.query(`
        ALTER TABLE ${tableName} 
        ADD COLUMN sequence_no INTEGER;
      `);

      // Update existing records with sequence numbers
      await queryInterface.sequelize.query(`
        WITH numbered_${table}s AS (
          SELECT id, ROW_NUMBER() OVER (ORDER BY "createdAt") as rnum
          FROM ${tableName}
        )
        UPDATE ${tableName} p
        SET sequence_no = np.rnum
        FROM numbered_${table}s np
        WHERE p.id = np.id;
      `);

      // Add NOT NULL constraint and default value
      await queryInterface.sequelize.query(`
        ALTER TABLE ${tableName} 
        ALTER COLUMN sequence_no SET NOT NULL,
        ALTER COLUMN sequence_no SET DEFAULT nextval('${seqName}');
      `);

      // Add unique constraint
      await queryInterface.sequelize.query(`
        ALTER TABLE ${tableName} 
        ADD CONSTRAINT ${tableName}_sequence_no_key UNIQUE (sequence_no);
      `);

      // Set the sequence to the next value after existing records
      await queryInterface.sequelize.query(`
        SELECT setval('${seqName}', COALESCE((SELECT MAX(sequence_no) FROM ${tableName}), 0) + 1, false);
      `);
    }
  },

  async down(queryInterface, Sequelize) {
    const tables = ['spinner', 'knitter', 'weaver', 'garment', 'fabric'];

    for (const table of tables) {
      const tableName = `${table}s`;
      const seqName = `${table}_seq`;

      // Drop the unique constraint
      await queryInterface.sequelize.query(`
        ALTER TABLE ${tableName} DROP CONSTRAINT IF EXISTS ${tableName}_sequence_no_key;
      `);

      // Drop the sequence_no column
      await queryInterface.sequelize.query(`
        ALTER TABLE ${tableName} DROP COLUMN IF EXISTS sequence_no;
      `);

      // Drop the sequence
      await queryInterface.sequelize.query(`
        DROP SEQUENCE IF EXISTS ${seqName};
      `);
    }
  }
};