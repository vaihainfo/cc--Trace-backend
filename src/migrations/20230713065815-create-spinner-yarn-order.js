'use strict';
/** @type {import('sequelize-cli').Migration} */
module.exports = {
  async up(queryInterface, Sequelize) {
    await queryInterface.createTable('spinner_yarn_orders', {
      id: {
        allowNull: false,
        autoIncrement: true,
        primaryKey: true,
        type: Sequelize.INTEGER
      },
      spinnerId: {
        type: Sequelize.INTEGER,
        allowNull: false,
        references: {
          model: 'spinners',
          key: 'id'
        }
      },
      date: {
        type: Sequelize.DATE,
        allowNull: false
      },
      orderReceivedDate: {
        type: Sequelize.DATE,
        allowNull: false
      },
      expectedYarnDispatchDate: {
        type: Sequelize.DATE,
        allowNull: false
      },
      brandOrderRefNumber: {
        type: Sequelize.STRING,
        allowNull: false
      },
      fabricMillOrderRefNumber: {
        type: Sequelize.STRING,
        allowNull: false
      },
      dateFabricMillPlacedOrder: {
        type: Sequelize.DATE,
        allowNull: false
      },
      spinnerInternalOrderNumber: {
        type: Sequelize.STRING,
        allowNull: false
      },
      reel_yarn_order_number: {
        type: Sequelize.STRING(100),
        allowNull: true,
        unique: true
      },
      yarnBlend: {
        type: Sequelize.INTEGER,
        allowNull: false,
        references: {
          model: 'cotton_mixes',
          key: 'id'
        }
      },
      yarnTypeSelect: {
        type: Sequelize.STRING,
        allowNull: false
      },
      yarnTypeOther: {
        type: Sequelize.STRING,
        allowNull: true
      },
      yarnCount: {
        type: Sequelize.INTEGER,
        allowNull: false,
        references: {
          model: 'yarn_counts',
          key: 'id'
        }
      },
      totalOrderQuantity: {
        type: Sequelize.STRING,
        allowNull: false
      },
      tentativeOrderCompletionDate: {
        type: Sequelize.DATE,
        allowNull: false
      },
      buyerType: {
        type: Sequelize.ENUM('Mapped', 'New Buyer'),
        allowNull: false
      },
      buyerOption: {
        type: Sequelize.INTEGER,
        allowNull: true
      },
      buyer_option_type: {
        type: Sequelize.STRING,
        allowNull: true
      },
      processId: {
        type: Sequelize.INTEGER,
        allowNull: true
      },
      createdAt: {
        allowNull: false,
        type: Sequelize.DATE
      },
      updatedAt: {
        allowNull: false,
        type: Sequelize.DATE
      }
    });

    // Create the sequence generation function
    await queryInterface.sequelize.query(`
      CREATE OR REPLACE FUNCTION generate_spinner_yarn_order_number()
      RETURNS TRIGGER AS $$
      DECLARE
          next_seq BIGINT;
          spinner_prefix VARCHAR(20);
          max_sequence_length INT := 10;
      BEGIN
          -- Get the next sequence number for this specific spinner
          SELECT COALESCE(MAX(
              CAST(NULLIF(
                  regexp_replace(
                      SPLIT_PART(reel_yarn_order_number, '-', 3), 
                      '[^0-9]', '', 'g'
                  ), '') AS BIGINT)
              ), 0) + 1 
          INTO next_seq
          FROM spinner_yarn_orders 
          WHERE "spinnerId" = NEW."spinnerId";

          -- Check if sequence exceeds maximum allowed length
          IF LENGTH(next_seq::TEXT) > max_sequence_length THEN
              RAISE EXCEPTION 'Sequence number exceeds maximum length of % digits', max_sequence_length
              USING HINT = 'Consider implementing a new numbering scheme';
          END IF;

          -- Format: S-spinnerId-sequence
          spinner_prefix := 'S-' || NEW."spinnerId"::TEXT || '-';
          
          -- Dynamic padding based on current sequence length
          NEW.reel_yarn_order_number := spinner_prefix || 
              LPAD(next_seq::TEXT, 
                   GREATEST(6, LENGTH(next_seq::TEXT)),
                   '0');
          
          RETURN NEW;

      EXCEPTION
          WHEN others THEN
              RAISE WARNING 'Error in generate_spinner_yarn_order_number: %', SQLERRM;
              RAISE;
      END;
      $$ LANGUAGE plpgsql;
    `);

    // Create the trigger
    await queryInterface.sequelize.query(`
      CREATE TRIGGER set_spinner_yarn_order_number
      BEFORE INSERT ON spinner_yarn_orders
      FOR EACH ROW
      EXECUTE FUNCTION generate_spinner_yarn_order_number();
    `);

    // Create index for better performance
    await queryInterface.addIndex('spinner_yarn_orders', ['reel_yarn_order_number'], {
      name: 'idx_spinner_yarn_orders_number'
    });
  },

  async down(queryInterface, Sequelize) {
    // Remove trigger and function
    await queryInterface.sequelize.query(`
      DROP TRIGGER IF EXISTS set_spinner_yarn_order_number ON spinner_yarn_orders;
      DROP FUNCTION IF EXISTS generate_spinner_yarn_order_number();
    `);

    // Remove index
    await queryInterface.removeIndex('spinner_yarn_orders', 'idx_spinner_yarn_orders_number');

    // Drop the table
    await queryInterface.dropTable('spinner_yarn_orders');

    // Remove ENUM types
    await queryInterface.sequelize.query(`
      DROP TYPE IF EXISTS enum_spinner_yarn_orders_buyer_type;
      DROP TYPE IF EXISTS enum_spinner_yarn_orders_buyer_option_type;
    `);
  }
};