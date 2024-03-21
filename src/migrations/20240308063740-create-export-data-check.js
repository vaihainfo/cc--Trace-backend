"use strict";

/** @type {import('sequelize-cli').Migration} */
module.exports = {
  async up(queryInterface, Sequelize) {
    /**
     * Add altering commands here.
     *
     * Example:
     * await queryInterface.createTable('users', { id: Sequelize.INTEGER });
     */
    await queryInterface.createTable("export_data_checks", {
      id: {
        type: Sequelize.INTEGER,
        autoIncrement: true,
        allowNull: false,
        primaryKey: true,
      },
      ginner_lint_bale_process_load: {
        type: Sequelize.BOOLEAN,
        defaultValue: false,
      },
      ginner_summary_load: {
        type: Sequelize.BOOLEAN,
        defaultValue: false,
      },
      ginner_lint_bale_sale_load: {
        type: Sequelize.BOOLEAN,
        defaultValue: false,
      },
      ginner_pending_sales_load: {
        type: Sequelize.BOOLEAN,
        defaultValue: false,
      },
      ginner_seed_cotton_load: {
        type: Sequelize.BOOLEAN,
        defaultValue: false,
      },
      spinner_summary_load: {
        type: Sequelize.BOOLEAN,
        defaultValue: false,
      },
      spinner_bale_receipt_load: {
        type: Sequelize.BOOLEAN,
        defaultValue: false,
      },
      spinner_yarn_process_load: {
        type: Sequelize.BOOLEAN,
        defaultValue: false,
      },
      spinner_yarn_sales_load: {
        type: Sequelize.BOOLEAN,
        defaultValue: false,
      },
      spinner_yarn_bales_load: {
        type: Sequelize.BOOLEAN,
        defaultValue: false,
      },
      spinner_lint_cotton_stock_load: {
        type: Sequelize.BOOLEAN,
        defaultValue: false,
      },
      knitter_yarn_receipt_load: {
        type: Sequelize.BOOLEAN,
        defaultValue: false,
      },
      knitter_yarn_process_load: {
        type: Sequelize.BOOLEAN,
        defaultValue: false,
      },
      knitter_fabric_sales_load: {
        type: Sequelize.BOOLEAN,
        defaultValue: false,
      },
      weaver_yarn_receipt_load: {
        type: Sequelize.BOOLEAN,
        defaultValue: false,
      },
      weaver_yarn_process_load: {
        type: Sequelize.BOOLEAN,
        defaultValue: false,
      },
      weaver_yarn_sales_load: {
        type: Sequelize.BOOLEAN,
        defaultValue: false,
      },
      garment_fabric_receipt_load: {
        type: Sequelize.BOOLEAN,
        defaultValue: false,
      },
      garment_fabric_process_load: {
        type: Sequelize.BOOLEAN,
        defaultValue: false,
      },
      garment_fabric_sales_load: {
        type: Sequelize.BOOLEAN,
        defaultValue: false,
      },
      qr_code_tracker_load: {
        type: Sequelize.BOOLEAN,
        defaultValue: false,
      },
      consolidated_tracebality_load: {
        type: Sequelize.BOOLEAN,
        defaultValue: false,
      },
      spinner_backward_tracebality_load: {
        type: Sequelize.BOOLEAN,
        defaultValue: false,
      },
      village_seed_cotton_load: {
        type: Sequelize.BOOLEAN,
        defaultValue: false,
      },
      premium_validation_load: {
        type: Sequelize.BOOLEAN,
        defaultValue: false,
      },
      procurement_load: {
        type: Sequelize.BOOLEAN,
        defaultValue: false,
      },
      failes_procurement_load: {
        type: Sequelize.BOOLEAN,
        defaultValue: false,
      },
      procurement_tracker_load: {
        type: Sequelize.BOOLEAN,
        defaultValue: false,
      },
      procurement_sell_live_tracker_load: {
        type: Sequelize.BOOLEAN,
        defaultValue: false,
      },
      qr_app_procurement_load: {
        type: Sequelize.BOOLEAN,
        defaultValue: false,
      },
      organic_farmer_load: {
        type: Sequelize.BOOLEAN,
        defaultValue: false,
      },
      non_organic_farmer_load: {
        type: Sequelize.BOOLEAN,
        defaultValue: false,
      },
      failed_farmer_load: {
        type: Sequelize.BOOLEAN,
        defaultValue: false,
      },
    });
    // await queryInterface.bulkInsert("export_data_checks", [
    //   {
    //     ginner_lint_bale_process_load: false,
    //     ginner_summary_load: false,
    //     ginner_lint_bale_sale_load: false,
    //     ginner_pending_sales_load: false,
    //     ginner_seed_cotton_load: false,
    //     spinner_summary_load: false,
    //     spinner_bale_receipt_load: false,
    //     spinner_yarn_process_load: false,
    //     spinner_yarn_sales_load: false,
    //     spinner_yarn_bales_load: false,
    //     spinner_lint_cotton_stock_load: false,
    //     knitter_yarn_receipt_load: false,
    //     knitter_yarn_process_load: false,
    //     knitter_fabric_sales_load: false,
    //     weaver_yarn_receipt_load: false,
    //     weaver_yarn_process_load: false,
    //     weaver_yarn_sales_load: false,
    //     garment_fabric_receipt_load: false,
    //     garment_fabric_process_load: false,
    //     garment_fabric_sales_load: false,
    //     qr_code_tracker_load: false,
    //     consolidated_tracebality_load: false,
    //     spinner_backward_tracebality_load: false,
    //     village_seed_cotton_load: false,
    //     premium_validation_load: false,
    //     procurement_load: false,
    //     failes_procurement_load: false,
    //     procurement_tracker_load: false,
    //     procurement_sell_live_tracker_load: false,
    //     qr_app_procurement_load: false,
    //     organic_farmer_load: false,
    //     non_organic_farmer_load: false,
    //     failed_farmer_load: false,
    //     createdAt: new Date(),
    //     updatedAt: new Date(),
    //   },
    // ]);
  },

  async down(queryInterface, Sequelize) {
    /**
     * Add reverting commands here.
     *
     * Example:
     * await queryInterface.dropTable('users');
     */
    await queryInterface.dropTable("export_data_checks");
    return queryInterface.bulkDelete("export_data_checks", null, {});
  },
};
