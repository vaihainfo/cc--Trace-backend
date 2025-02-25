'use strict';

/** @type {import('sequelize-cli').Migration} */
module.exports = {
  async up(queryInterface, Sequelize) {
    // Drop existing trigger and function
    await queryInterface.sequelize.query(`
      DROP TRIGGER IF EXISTS set_spinner_yarn_order_number ON spinner_yarn_orders;
      DROP FUNCTION IF EXISTS generate_spinner_yarn_order_number();
    `);

    // Create new function with updated format
    await queryInterface.sequelize.query(`
      CREATE OR REPLACE FUNCTION generate_spinner_yarn_order_number()
      RETURNS TRIGGER AS $$
      DECLARE
          next_seq BIGINT;
          country_code VARCHAR(20);
          state_code VARCHAR(20);
          brand_code VARCHAR(20);
          processor_type VARCHAR(20) := 'GN';
          programme_code VARCHAR(20);
          max_sequence_length INT := 3;
      BEGIN
          -- Get spinner details
          SELECT 
              COALESCE(UPPER(SUBSTRING(c.county_name, 1, 2)), ''),
              COALESCE(UPPER(SUBSTRING(s.state_name, 1, 2)), ''),
              COALESCE(UPPER(SUBSTRING(b.brand_name, 1, 2)), ''),
              COALESCE(UPPER(SUBSTRING(p.program_name, 1, 2)), '')
          INTO 
              country_code,
              state_code,
              brand_code,
              programme_code
          FROM spinners sp
          LEFT JOIN countries c ON sp.country_id = c.id
          LEFT JOIN states s ON sp.state_id = s.id
          LEFT JOIN brands b ON sp.brand[1] = b.id
          LEFT JOIN programs p ON sp.program_id[1] = p.id
          WHERE sp.id = NEW."spinnerId";

          -- Get the next sequence number
          SELECT COALESCE(MAX(
              CAST(NULLIF(
                  regexp_replace(
                      RIGHT(reel_yarn_order_number, 3), 
                      '[^0-9]', '', 'g'
                  ), '') AS BIGINT)
              ), 0) + 1 
          INTO next_seq
          FROM spinner_yarn_orders 
          WHERE "spinnerId" = NEW."spinnerId";

          -- Check sequence length
          IF LENGTH(next_seq::TEXT) > max_sequence_length THEN
              RAISE EXCEPTION 'Sequence number exceeds maximum length of % digits', max_sequence_length;
          END IF;

          -- Format: {country}{state}{brand}{processorType}{programme}{sequence}
          NEW.reel_yarn_order_number := 
              country_code ||
              state_code ||
              brand_code ||
              processor_type ||
              programme_code ||
              LPAD(next_seq::TEXT, 3, '0');

          RETURN NEW;

      EXCEPTION
          WHEN others THEN
              RAISE WARNING 'Error in generate_spinner_yarn_order_number: %', SQLERRM;
              RAISE;
      END;
      $$ LANGUAGE plpgsql;
    `);

    // Create new trigger
    await queryInterface.sequelize.query(`
      CREATE TRIGGER set_spinner_yarn_order_number
      BEFORE INSERT ON spinner_yarn_orders
      FOR EACH ROW
      EXECUTE FUNCTION generate_spinner_yarn_order_number();
    `);

    // Update existing records
    await queryInterface.sequelize.query(`
      WITH spinner_details AS (
        SELECT 
          syo.id,
          COALESCE(UPPER(SUBSTRING(c.county_name, 1, 2)), '') as country_code,
          COALESCE(UPPER(SUBSTRING(s.state_name, 1, 2)), '') as state_code,
          COALESCE(UPPER(SUBSTRING(b.brand_name, 1, 2)), '') as brand_code,
          COALESCE(UPPER(SUBSTRING(p.program_name, 1, 2)), '') as programme_code,
          ROW_NUMBER() OVER (PARTITION BY syo."spinnerId" ORDER BY syo.id) as seq
        FROM spinner_yarn_orders syo
        JOIN spinners sp ON syo."spinnerId" = sp.id
        LEFT JOIN countries c ON sp.country_id = c.id
        LEFT JOIN states s ON sp.state_id = s.id
        LEFT JOIN brands b ON sp.brand[1] = b.id
        LEFT JOIN programs p ON sp.program_id[1] = p.id
      )
      UPDATE spinner_yarn_orders syo
      SET reel_yarn_order_number = 
        sd.country_code ||
        sd.state_code ||
        sd.brand_code ||
        'GN' ||
        sd.programme_code ||
        LPAD(sd.seq::TEXT, 3, '0')
      FROM spinner_details sd
      WHERE syo.id = sd.id;
    `);
  },

  async down(queryInterface, Sequelize) {
    await queryInterface.sequelize.query(`
      DROP TRIGGER IF EXISTS set_spinner_yarn_order_number ON spinner_yarn_orders;
      DROP FUNCTION IF EXISTS generate_spinner_yarn_order_number();
    `);
  }
};