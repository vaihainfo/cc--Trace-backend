'use strict';

/** @type {import('sequelize-cli').Migration} */
module.exports = {
  async up (queryInterface, Sequelize) {
    await queryInterface.addColumn('spin_sale_yarn_selecteds', 'reel_lot_no', {
      type: Sequelize.STRING,
    });

    await queryInterface.addColumn('spin_sale_yarn_selecteds', 'qty_used', {
      type: Sequelize.DOUBLE,
    });
  },

  async down (queryInterface, Sequelize) {
    await queryInterface.removeColumn('spin_sale_yarn_selecteds', 'reel_lot_no');
    await queryInterface.removeColumn('spin_sale_yarn_selecteds', 'qty_used');
  }
};
