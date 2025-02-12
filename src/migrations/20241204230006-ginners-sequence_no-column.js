'use strict';

/** @type {import('sequelize-cli').Migration} */
module.exports = {
  async up(queryInterface, Sequelize) {
    // Create sequence
    await queryInterface.sequelize.query(`
      CREATE SEQUENCE IF NOT EXISTS ginner_seq START 1;
    `);

    // Add sequence_no column
    await queryInterface.sequelize.query(`
      ALTER TABLE ginners 
      ADD COLUMN sequence_no INTEGER;
    `);

    // Update existing records with sequence numbers
    await queryInterface.sequelize.query(`
      WITH numbered_ginners AS (
        SELECT id, ROW_NUMBER() OVER (ORDER BY "createdAt") as rnum
        FROM ginners
      )
      UPDATE ginners g
      SET sequence_no = ng.rnum
      FROM numbered_ginners ng
      WHERE g.id = ng.id;
    `);

    // Add NOT NULL constraint and default value
    await queryInterface.sequelize.query(`
      ALTER TABLE ginners 
      ALTER COLUMN sequence_no SET NOT NULL,
      ALTER COLUMN sequence_no SET DEFAULT nextval('ginner_seq');
    `);

    // Add unique constraint
    await queryInterface.sequelize.query(`
      ALTER TABLE ginners 
      ADD CONSTRAINT ginners_sequence_no_key UNIQUE (sequence_no);
    `);

    // Set the sequence to the next value after existing records
    await queryInterface.sequelize.query(`
      SELECT setval('ginner_seq', COALESCE((SELECT MAX(sequence_no) FROM ginners), 0) + 1, false);
    `);
  },

  async down(queryInterface, Sequelize) {
    // Drop the unique constraint
    await queryInterface.sequelize.query(`
      ALTER TABLE ginners DROP CONSTRAINT IF EXISTS ginners_sequence_no_key;
    `);

    // Drop the sequence_no column
    await queryInterface.sequelize.query(`
      ALTER TABLE ginners DROP COLUMN IF EXISTS sequence_no;
    `);

    // Drop the sequence
    await queryInterface.sequelize.query(`
      DROP SEQUENCE IF EXISTS ginner_seq;
    `);
  }
};
