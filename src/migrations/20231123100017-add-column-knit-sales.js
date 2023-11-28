'use strict';

/** @type {import('sequelize-cli').Migration} */
module.exports = {
  async up (queryInterface, Sequelize) {
    await queryInterface.removeColumn('knit_sales', 'order_ref');
    await queryInterface.removeColumn('knit_sales', 'fabric_type');
    await queryInterface.removeColumn('knit_sales', 'fabric_length');
    await queryInterface.removeColumn('knit_sales', 'fabric_gsm');
    await queryInterface.removeColumn('knit_sales', 'fabric_weight');
    await queryInterface.removeColumn('knit_sales', 'job_details_garment');
    await queryInterface.removeColumn('knit_sales', 'bale_ids');
    await queryInterface.removeColumn('knit_sales', 'cottonmix_type');
    await queryInterface.removeColumn('knit_sales', 'cottonmix_qty');
    await queryInterface.removeColumn('knit_sales', 'invoice_file');
    await queryInterface.removeColumn('knit_sales', 'blend_choose');
    await queryInterface.removeColumn('knit_sales', 'additional_yarn_qty');
    await queryInterface.removeColumn('knit_sales', 'dyeing_required');
    await queryInterface.removeColumn('knit_sales', 'dyeing_id');

    await queryInterface.addColumn('knit_sales', 'garment_order_ref', {
      type: Sequelize.STRING
    });
    await queryInterface.addColumn('knit_sales', 'brand_order_ref', {
      type: Sequelize.STRING
    });
    await queryInterface.addColumn('knit_sales', 'reel_lot_no', {
      type: Sequelize.STRING
    });
    await queryInterface.addColumn('knit_sales', 'fabric_type', {
      type: Sequelize.ARRAY(Sequelize.INTEGER)
    });
    await queryInterface.addColumn('knit_sales', 'no_of_rolls', {
      type: Sequelize.INTEGER
    });
    await queryInterface.addColumn('knit_sales', 'invoice_file', {
      type: Sequelize.ARRAY(Sequelize.STRING)
    });
  },

  async down (queryInterface, Sequelize) {
    /**
     * Add reverting commands here.
     *
     * Example:
     * await queryInterface.dropTable('users');
     */

    await queryInterface.removeColumn('knit_sales', 'garment_order_ref');
    await queryInterface.removeColumn('knit_sales', 'brand_order_ref');
    await queryInterface.removeColumn('knit_sales', 'reel_lot_no');
    await queryInterface.removeColumn('knit_sales', 'fabric_type');
    await queryInterface.removeColumn('knit_sales', 'no_of_rolls');
    await queryInterface.removeColumn('knit_sales', 'invoice_file');
  }
};
