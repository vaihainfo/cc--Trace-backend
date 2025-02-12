'use strict';

/** @type {import('sequelize-cli').Migration} */
module.exports = {
  async up (queryInterface, Sequelize) {
    await queryInterface.createTable('combernoil_generations', {
      id: {
        allowNull: false,
        autoIncrement: true,
        primaryKey: true,
        type: Sequelize.INTEGER
      },
      spinner_id: {
        type: Sequelize.INTEGER,
        allowNull: false
      },
      process_id: {
        type: Sequelize.INTEGER,
        allowNull: true,
        comment: 'ID from process if yarn type is combed and combernoil generated during process'
      },
      sales_id: {
        type: Sequelize.INTEGER,
        allowNull: true,
        comment: 'ID from spin_combernoil_sale if purchased from other spinner'
      },
      old_combernoil_id: {
        type: Sequelize.INTEGER,
        allowNull: true,
        references: {
          model: 'combernoil_generations',
          key: 'id'
        },
        comment: 'ID from combernoil_generation if used from other spinner'
      },
      total_qty: {
        type: Sequelize.DOUBLE,
        allowNull: false,
        comment: 'Total combernoil quantity'
      },
      qty_stock: {
        type: Sequelize.DOUBLE,
        allowNull: false,
        comment: 'Available stock after combernoil used'
      },
      created_date: {
        type: Sequelize.DATE,
        defaultValue: Sequelize.NOW
      },
      updated_date: {
        type: Sequelize.DATE,
        defaultValue: Sequelize.NOW
      }
    });
     // 1. Fetch data from spin_process table
     const spinProcesses = await queryInterface.sequelize.query(
      `SELECT id, spinner_id, comber_noil, comber_noil_stock 
       FROM spin_processes 
       WHERE comber_noil IS NOT NULL AND comber_noil > 0`,
      { type: Sequelize.QueryTypes.SELECT }
    );

    // 2. Prepare data for insertion
    const combernoilData = spinProcesses.map(process => ({
      spinner_id: process.spinner_id,
      process_id: process.id,
      total_qty: process.comber_noil,
      qty_stock: process.comber_noil_stock,
      created_date: new Date(),
      updated_date: new Date()
    }));

    // 3. Insert data into combernoil_generations
    if (combernoilData.length > 0) {
      await queryInterface.bulkInsert('combernoil_generations', combernoilData);
    }
    console.log(`Migrated ${combernoilData.length} records successfully`);
  },

  async down (queryInterface, Sequelize) {
    await queryInterface.dropTable('combernoil_generations');
  }
};
