'use strict';

/** @type {import('sequelize-cli').Migration} */
module.exports = {
  async up (queryInterface, Sequelize) {
    await queryInterface.changeColumn('processor_trainings', 'brand_id', {
      type: Sequelize.INTEGER, // Adjust the data type accordingly
      allowNull: true, // Set allowNull to true
    });

    await queryInterface.changeColumn('processor_trainings', 'country_id', {
      type: Sequelize.INTEGER, // Adjust the data type accordingly
      allowNull: true, // Set allowNull to true
    });

    await queryInterface.removeColumn('processor_trainings', 'state_id');


    await queryInterface.addColumn('processor_trainings', 'state_id', {
      type: Sequelize.INTEGER, // Adjust the data type accordingly
      allowNull: true, // Set allowNull to true
      references: { model: 'states', key: 'id' },
      onDelete: 'SET NULL',
    });

    await queryInterface.addConstraint('processor_trainings', {
      fields: ['brand_id'],
      type: 'foreign key',
      references: {
        table: 'brands', // The name of the referenced table
        field: 'id', // The referenced column
      },
      onDelete: 'SET NULL', // Set to SET NULL on delete
      onUpdate: 'CASCADE', // Set the desired update behavior
    });

    await queryInterface.addConstraint('processor_trainings', {
      fields: ['country_id'],
      type: 'foreign key',
      references: {
        table: 'countries', // The name of the referenced table
        field: 'id', // The referenced column
      },
      onDelete: 'SET NULL', // Set to SET NULL on delete
      onUpdate: 'CASCADE', // Set the desired update behavior
    });
  },
  

  async down (queryInterface, Sequelize) {
    await queryInterface.removeConstraint('processor_trainings', 'processor_trainings_brand_id_fkey');
    await queryInterface.removeConstraint('processor_trainings', 'processor_trainings_country_id_fkey');

    await queryInterface.removeColumn('processor_trainings', 'state_id');

    await queryInterface.addColumn('processor_trainings', 'state_id', {
      type: Sequelize.STRING,
      allowNull: false, // Set allowNull to true if needed
    });

    await queryInterface.changeColumn('processor_trainings', 'brand_id', {
      type: Sequelize.INTEGER, // Adjust the data type accordingly
      allowNull: false, // Set allowNull to true
    });

    await queryInterface.changeColumn('processor_trainings', 'country_id', {
      type: Sequelize.INTEGER, // Adjust the data type accordingly
      allowNull: false, // Set allowNull to true
    });

  }
};
