'use strict';

/** @type {import('sequelize-cli').Migration} */
module.exports = {
  up: async (queryInterface, Sequelize) => {
    return await Promise.all([
      queryInterface.removeColumn('farmers', 'no_of_children'),
      queryInterface.removeColumn('farmers', 'no_of_adults'),
      queryInterface.removeColumn('farmers', 'no_of_family_members'),
      queryInterface.removeColumn('farmers', 'irrigationSource'),
      queryInterface.removeColumn('farmers', 'soilTexture'),
      queryInterface.removeColumn('farmers', 'soilType'),
      queryInterface.removeColumn('farmers', 'image'),
      queryInterface.removeColumn('farmers', 'age'),
      queryInterface.removeColumn('farmers', 'qualification'),
      queryInterface.removeColumn('farmers', 'phone'),
      queryInterface.removeColumn('farmers', 'mobile'),
      queryInterface.removeColumn('farmers', 'marital_status'),
      queryInterface.removeColumn('farmers', 'gender'),
      queryInterface.removeColumn('farmers', 'fatherName'),
      queryInterface.removeColumn('farmers', 'middleName'),
      queryInterface.removeColumn('farmer_cotton_areas', 'last_year_cotton_area'),
      queryInterface.removeColumn('farmer_cotton_areas', 'last_year_cotton_price'),
      queryInterface.removeColumn('farmer_cotton_areas', 'last_year_yield'),
      queryInterface.removeColumn('farmer_cotton_areas', 'cotton_estimated_area'),
      queryInterface.removeColumn('farmer_cotton_areas', 'cotton_transacted'),
      queryInterface.removeColumn('farmer_cotton_areas', 'cotton_under_drip'),
      queryInterface.removeColumn('farmer_cotton_areas', 'cotton_rainfed'),
      queryInterface.removeColumn('farmer_cotton_areas', 'cotton_supportive_irrigation'),
      queryInterface.removeColumn('farmer_cotton_areas', 'cotton_irrigated'),
      queryInterface.removeColumn('farmer_agri_areas', 'agri_irrigated'),
      queryInterface.removeColumn('farmer_agri_areas', 'agri_supportive_irrigation'),
      queryInterface.removeColumn('farmer_agri_areas', 'agri_rainfed'),
      queryInterface.removeColumn('farmer_agri_areas', 'agri_under_drip'),
      queryInterface.dropTable('farmer_assets'),
      queryInterface.dropTable('farmer_places')
    ])

  },

  down: async (queryInterface, Sequelize) => {
    await queryInterface.dropTable('farmers');
  }
};
