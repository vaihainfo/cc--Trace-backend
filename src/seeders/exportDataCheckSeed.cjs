import ExportData from "../models/export-data-check.model";

async function seedUsers() {
  try {
    // Insert seed data into the User table

    const data = await ExportData.findAll();
    if (data?.lemgth) {
      console.log("Seed data already fetched ");
    } else {
      const usersSeedData = {
        ginner_lint_bale_process_load: false,
        ginner_summary_load: false,
        ginner_lint_bale_sale_load: false,
        ginner_pending_sales_load: false,
        ginner_seed_cotton_load: false,
        spinner_summary_load: false,
        spinner_bale_receipt_load: false,
        spinner_yarn_process_load: false,
        spinner_yarn_sales_load: false,
        spinner_yarn_bales_load: false,
        spinner_lint_cotton_stock_load: false,
        knitter_yarn_receipt_load: false,
        knitter_yarn_process_load: false,
        knitter_fabric_sales_load: false,
        weaver_yarn_receipt_load: false,
        weaver_yarn_process_load: false,
        weaver_yarn_sales_load: false,
        garment_fabric_receipt_load: false,
        garment_fabric_process_load: false,
        garment_fabric_sales_load: false,
        qr_code_tracker_load: false,
        consolidated_tracebality_load: false,
        spinner_backward_tracebality_load: false,
        village_seed_cotton_load: false,
        premium_validation_load: false,
        procurement_load: false,
        failes_procurement_load: false,
        procurement_tracker_load: false,
        procurement_sell_live_tracker_load: false,
        qr_app_procurement_load: false,
        organic_farmer_load: false,
        non_organic_farmer_load: false,
        failed_farmer_load: false,
        createdAt: new Date(),
        updatedAt: new Date(),
      };

      await ExportData.create(usersSeedData);
      console.log("Seed data create  successfully ");
    }
  } catch (error) {
    console.error("Error seeding data:", error);
  }
}

seedUsers();
