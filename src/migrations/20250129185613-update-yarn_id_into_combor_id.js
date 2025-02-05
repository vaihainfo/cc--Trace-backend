'use strict';

/** @type {import('sequelize-cli').Migration} */
module.exports = {
  async up(queryInterface, Sequelize) {
    try {
      // Get all records from comber_selections
      const comberSelections = await queryInterface.sequelize.query(
        `SELECT id, yarn_id FROM comber_selections WHERE yarn_id IS NOT NULL`,
        { type: Sequelize.QueryTypes.SELECT }
      );

      // For each comber selection, check and update
      for (const selection of comberSelections) {
        // Check if yarn_id exists in combernoil_generations.process_id
        const exists = await queryInterface.sequelize.query(
          `SELECT id FROM combernoil_generations WHERE process_id = :yarnId LIMIT 1`,
          {
            replacements: { yarnId: selection.yarn_id },
            type: Sequelize.QueryTypes.SELECT
          }
        );

        if (exists && exists.length > 0) {
          // Update the yarn_id in comber_selections
          await queryInterface.sequelize.query(
            `UPDATE comber_selections SET yarn_id = :yarnId WHERE id = :id`,
            {
              replacements: { 
                yarnId: exists[0].id,
                id: selection.id 
              },
              type: Sequelize.QueryTypes.UPDATE
            }
          );
        }
      }
    } catch (error) {
      console.error('Migration Error:', error);
      throw error;
    }
  },

  async down(queryInterface, Sequelize) {
    // If needed, write code to revert the changes
  }
};