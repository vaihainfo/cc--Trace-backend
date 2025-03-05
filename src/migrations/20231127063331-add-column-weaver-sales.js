'use strict';

/** @type {import('sequelize-cli').Migration} */
module.exports = {
  async up (queryInterface, Sequelize) {
    /**
     * Add altering commands here.
     *
     * Example:
     * await queryInterface.createTable('users', { id: Sequelize.INTEGER });
     */
    await queryInterface.removeColumn('weaver_sales', 'order_ref');
    await queryInterface.removeColumn('weaver_sales', 'fabric_type');
    await queryInterface.removeColumn('weaver_sales', 'fabric_length');
    await queryInterface.removeColumn('weaver_sales', 'fabric_gsm');
    await queryInterface.removeColumn('weaver_sales', 'fabric_weight');
    await queryInterface.removeColumn('weaver_sales', 'fabric_contruction');
    await queryInterface.removeColumn('weaver_sales', 'job_details_garment');
    await queryInterface.removeColumn('weaver_sales', 'warn_yarn_qty');
    await queryInterface.removeColumn('weaver_sales', 'weft_choosen');
    await queryInterface.removeColumn('weaver_sales', 'weft_yarn_qty');
    await queryInterface.removeColumn('weaver_sales', 'bale_ids');
    await queryInterface.removeColumn('weaver_sales', 'weft_cottonmix_type');
    await queryInterface.removeColumn('weaver_sales', 'weft_cottonmix_qty');
    await queryInterface.removeColumn('weaver_sales', 'invoice_file');
    await queryInterface.removeColumn('weaver_sales', 'no_of_bales');
    await queryInterface.removeColumn('weaver_sales', 'dyeing_required');
    await queryInterface.removeColumn('weaver_sales', 'dyeing_id');

    await queryInterface.addColumn('weaver_sales', 'yarn_qty', {
      type: Sequelize.DOUBLE
    });
    await queryInterface.addColumn('weaver_sales', 'garment_order_ref', {
      type: Sequelize.STRING
    });
    await queryInterface.addColumn('weaver_sales', 'brand_order_ref', {
      type: Sequelize.STRING
    });
    await queryInterface.addColumn('weaver_sales', 'reel_lot_no', {
      type: Sequelize.STRING
    });
    await queryInterface.addColumn('weaver_sales', 'fabric_type', {
      type: Sequelize.ARRAY(Sequelize.INTEGER)
    });
    await queryInterface.addColumn('weaver_sales', 'no_of_rolls', {
      type: Sequelize.INTEGER
    });
    await queryInterface.addColumn('weaver_sales', 'invoice_file', {
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

    await queryInterface.removeColumn('weaver_sales', 'garment_order_ref');
    await queryInterface.removeColumn('weaver_sales', 'brand_order_ref');
    await queryInterface.removeColumn('weaver_sales', 'reel_lot_no');
    await queryInterface.removeColumn('weaver_sales', 'fabric_type');
    await queryInterface.removeColumn('weaver_sales', 'no_of_rolls');
    await queryInterface.removeColumn('weaver_sales', 'invoice_file');
  }
};
