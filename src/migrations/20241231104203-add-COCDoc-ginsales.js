'use strict';

/** @type {import('sequelize-cli').Migration} */
module.exports = {
  async up (queryInterface, Sequelize) {
    await queryInterface.addColumn('gin_sales', 'coc_doc', {
      type: Sequelize.STRING
    });
  },

  
};
