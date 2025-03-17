'use strict';

/** @type {import('sequelize-cli').Migration} */
module.exports = {
  async up(queryInterface, Sequelize) {
    // Drop existing trigger and function if they exist
    await queryInterface.sequelize.query(`
      DROP TRIGGER IF EXISTS set_traceable_reel_quotation_order_number ON spinner_place_lint_orders;
      DROP FUNCTION IF EXISTS generate_traceable_reel_quotation_order_number();
    `);

    // Create new function with the format
    await queryInterface.sequelize.query(`
      CREATE OR REPLACE FUNCTION generate_traceable_reel_quotation_order_number()
      RETURNS TRIGGER AS $$
      DECLARE
          next_seq BIGINT;
          country_code VARCHAR(20);
          state_code VARCHAR(20);
          brand_code VARCHAR(20);
          processor_type VARCHAR(20) := 'SP';
          programme_code VARCHAR(20);
          max_sequence_length INT := 3;
      BEGIN
          -- Get ginner details
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
          FROM ginners g
          LEFT JOIN countries c ON g.country_id = c.id
          LEFT JOIN states s ON g.state_id = s.id
          LEFT JOIN brands b ON g.brand[1] = b.id
          LEFT JOIN programs p ON g.program_id[1] = p.id
          WHERE g.id = NEW."ginnerId";

          -- Get the next sequence number
          SELECT COALESCE(MAX(
              CAST(NULLIF(
                  regexp_replace(
                      RIGHT("traceableReelQuotationOrderNumber", 3), 
                      '[^0-9]', '', 'g'
                  ), '') AS BIGINT)
              ), 0) + 1 
          INTO next_seq
          FROM spinner_place_lint_orders 
          WHERE "ginnerId" = NEW."ginnerId";

          -- Check sequence length
          IF LENGTH(next_seq::TEXT) > max_sequence_length THEN
              RAISE EXCEPTION 'Sequence number exceeds maximum length of % digits', max_sequence_length;
          END IF;

          -- Format: {country}{state}{brand}{processorType}{programme}{sequence}
          NEW."traceableReelQuotationOrderNumber" := 
              country_code ||
              state_code ||
              brand_code ||
              processor_type ||
              programme_code ||
              LPAD(next_seq::TEXT, 3, '0');

          RETURN NEW;

      EXCEPTION
          WHEN others THEN
              RAISE WARNING 'Error in generate_traceable_reel_quotation_order_number: %', SQLERRM;
              RAISE;
      END;
      $$ LANGUAGE plpgsql;
    `);

    // Create new trigger
    await queryInterface.sequelize.query(`
      CREATE TRIGGER set_traceable_reel_quotation_order_number
      BEFORE INSERT ON spinner_place_lint_orders
      FOR EACH ROW
      EXECUTE FUNCTION generate_traceable_reel_quotation_order_number();
    `);
  },

  async down(queryInterface, Sequelize) {
    await queryInterface.sequelize.query(`
      DROP TRIGGER IF EXISTS set_traceable_reel_quotation_order_number ON spinner_place_lint_orders;
      DROP FUNCTION IF EXISTS generate_traceable_reel_quotation_order_number();
    `);
  }
};
