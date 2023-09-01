'use strict';

/** @type {import('sequelize-cli').Migration} */
module.exports = {
  async up (queryInterface, Sequelize) {
    await queryInterface.addColumn('users', 'firstname', {
      type: Sequelize.STRING,
      allowNull: false, // Or false, depending on your requirements
    });

    await queryInterface.addColumn('users', 'lastname', {
      type: Sequelize.STRING,
    });

    await queryInterface.addColumn('users', 'mobile', {
      type: Sequelize.STRING,
      allowNull: false, // Or true, depending on your requirements
    });

    await queryInterface.addColumn('users', 'farm_group', {
      type: Sequelize.STRING,
    });

    await queryInterface.addColumn('users', 'position', {
      type: Sequelize.STRING,
    });

    await queryInterface.addColumn('users', 'countries_web', {
      type: Sequelize.ARRAY(Sequelize.INTEGER),
    });

    await queryInterface.addColumn('users', 'access_level', {
      type: Sequelize.ARRAY(Sequelize.STRING),
    });

    await queryInterface.addColumn('users', 'country_id', {
      type: Sequelize.INTEGER,
    });

    await queryInterface.addColumn('users', 'state_id', {
      type: Sequelize.INTEGER,
    });

    await queryInterface.addColumn('users', 'district_id', {
      type: Sequelize.ARRAY(Sequelize.INTEGER),
    });

    await queryInterface.addColumn('users', 'block_id', {
      type: Sequelize.ARRAY(Sequelize.INTEGER),
    });

    await queryInterface.addColumn('users', 'village_id', {
      type: Sequelize.ARRAY(Sequelize.INTEGER),
    });

    await queryInterface.addColumn('users', 'role', {
      type: Sequelize.INTEGER,
      defaultValue: 0,
    });

    await queryInterface.addColumn('users', 'brand_mapped', {
      type: Sequelize.ARRAY(Sequelize.INTEGER),
    });

    await queryInterface.addColumn('users', 'ticketApproveAccess', {
      type: Sequelize.BOOLEAN
    });

    await queryInterface.addColumn('users', 'ticketCountryAccess', {
      type: Sequelize.ARRAY(Sequelize.STRING),
    });

    await queryInterface.addColumn('users', 'ticketAccessOnly', {
      type: Sequelize.BOOLEAN
    });

    await queryInterface.addColumn('users', 'isManagementUser', {
      type: Sequelize.BOOLEAN,
      allowNull: false,
      defaultValue: false,
    });

    await queryInterface.addColumn('users', 'status', {
      type: Sequelize.BOOLEAN,
      allowNull: false,
      defaultValue: true,
    });
  },

  async down (queryInterface, Sequelize) {
    await queryInterface.removeColumn('users', 'firstname');
    await queryInterface.removeColumn('users', 'lastname');
    await queryInterface.removeColumn('users', 'mobile');
    await queryInterface.removeColumn('users', 'farm_id');
    await queryInterface.removeColumn('users', 'position');
    await queryInterface.removeColumn('users', 'countries_web');
    await queryInterface.removeColumn('users', 'access_level');
    await queryInterface.removeColumn('users', 'country_id');
    await queryInterface.removeColumn('users', 'state_id');
    await queryInterface.removeColumn('users', 'district_id');
    await queryInterface.removeColumn('users', 'block_id');
    await queryInterface.removeColumn('users', 'village_id');
    await queryInterface.removeColumn('users', 'role');
    await queryInterface.removeColumn('users', 'brand_mapped');
    await queryInterface.removeColumn('users', 'ticketApproveAccess');
    await queryInterface.removeColumn('users', 'ticketCountryAccess');
    await queryInterface.removeColumn('users', 'ticketAccessOnly');
    await queryInterface.removeColumn('users', 'isManagementUser');
    await queryInterface.removeColumn('users', 'status');
  }
};
