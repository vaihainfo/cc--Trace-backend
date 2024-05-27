'use strict';

module.exports = {
  up: async (queryInterface, Sequelize) => {
    // Define an array of processor types and their corresponding user ID column names
    const processors = [
      { tableName: 'ginners', userIdColumn: 'ginnerUser_id' },
      { tableName: 'spinners', userIdColumn: 'spinnerUser_id' },
      { tableName: 'knitters', userIdColumn: 'knitterUser_id' },
      { tableName: 'weavers', userIdColumn: 'weaverUser_id' },
      { tableName: 'garments', userIdColumn: 'garmentUser_id' },
      { tableName: 'fabrics', userIdColumn: 'fabricUser_id' },
      { tableName: 'physical_partners', userIdColumn: 'physicalPartnerUser_id' },
      // Add more processor types as needed
    ];

    await Promise.all(processors.map(async (processor) => {
      await queryInterface.addColumn(processor.tableName, 'status', {
        allowNull: false,
        defaultValue: true,
        type: Sequelize.BOOLEAN
      });
    }));

    // Set status based on existence of corresponding records in user table for each processor type
    await Promise.all(processors.map(async (processor) => {
      await queryInterface.sequelize.query(`
        UPDATE ${processor.tableName}
        SET status = u.status
        FROM users u
        WHERE u.id = ANY(${processor.tableName}."${processor.userIdColumn}");
      `);
    }));
  },

  down: async (queryInterface, Sequelize) => {
    // Define an array of processor types
    const processorTableNames = ['ginners', 'spinners', 'knitters','weavers','garments','fabrics','physical_partner'];
    // Remove status column from processor tables
    await Promise.all(processorTableNames.map(async (tableName) => {
      await queryInterface.removeColumn(tableName, 'status');
    }));
  }
};
