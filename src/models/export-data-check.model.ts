import { DataTypes } from 'sequelize';
import db from '../util/dbConn';



const ExportData = db.define('export_data_checks', {
  id: {
    type: DataTypes.INTEGER,
    autoIncrement: true,
    allowNull: false,
    primaryKey: true
  },
  ginner_lint_bale_process_load:{
    type:DataTypes.BOOLEAN,
    defaultValue: false
  },ginner_summary_load:{
    type:DataTypes.BOOLEAN,
    defaultValue: false
  },ginner_lint_bale_sale_load:{
    type:DataTypes.BOOLEAN,
    defaultValue: false
  },ginner_pending_sales_load:{
    type:DataTypes.BOOLEAN,
    defaultValue: false
  },ginner_seed_cotton_load:{
    type:DataTypes.BOOLEAN,
    defaultValue: false
  },spinner_summary_load:{
    type:DataTypes.BOOLEAN,
    defaultValue: false
  },spinner_bale_receipt_load:{
    type:DataTypes.BOOLEAN,
    defaultValue: false
  },spinner_yarn_process_load:{
    type:DataTypes.BOOLEAN,
    defaultValue: false
  },spinner_yarn_sales_load:{
    type:DataTypes.BOOLEAN,
    defaultValue: false
  },spinner_yarn_bales_load:{
    type:DataTypes.BOOLEAN,
    defaultValue: false
  },spinner_lint_cotton_stock_load:{
    type:DataTypes.BOOLEAN,
    defaultValue: false
  },knitter_yarn_receipt_load:{
    type:DataTypes.BOOLEAN,
    defaultValue: false
  },knitter_yarn_process_load:{
    type:DataTypes.BOOLEAN,
    defaultValue: false
  },knitter_fabric_sales_load:{
    type:DataTypes.BOOLEAN,
    defaultValue: false
  },weaver_yarn_receipt_load:{
    type:DataTypes.BOOLEAN,
    defaultValue: false
  },weaver_yarn_process_load:{
    type:DataTypes.BOOLEAN,
    defaultValue: false
  },weaver_yarn_sales_load:{
    type:DataTypes.BOOLEAN,
    defaultValue: false
  },garment_fabric_receipt_load:{
    type:DataTypes.BOOLEAN,
    defaultValue: false
  },garment_fabric_process_load:{
    type:DataTypes.BOOLEAN,
    defaultValue: false
  },garment_fabric_sales_load:{
    type:DataTypes.BOOLEAN,
    defaultValue: false
  },qr_code_tracker_load:{
    type:DataTypes.BOOLEAN,
    defaultValue: false
  },consolidated_tracebality_load:{
    type:DataTypes.BOOLEAN,
    defaultValue: false
  },spinner_backward_tracebality_load:{
    type:DataTypes.BOOLEAN,
    defaultValue: false
  },village_seed_cotton_load:{
    type:DataTypes.BOOLEAN,
    defaultValue: false
  },premium_validation_load:{
    type:DataTypes.BOOLEAN,
    defaultValue: false
  },procurement_load:{
    type:DataTypes.BOOLEAN,
    defaultValue: false
  },failes_procurement_load:{
    type:DataTypes.BOOLEAN,
    defaultValue: false
  },procurement_tracker_load:{
    type:DataTypes.BOOLEAN,
    defaultValue: false
  },procurement_sell_live_tracker_load:{
    type:DataTypes.BOOLEAN,
    defaultValue: false
  },qr_app_procurement_load:{
    type:DataTypes.BOOLEAN,
    defaultValue: false
  },organic_farmer_load:{
    type:DataTypes.BOOLEAN,
    defaultValue: false
  },non_organic_farmer_load:{
    type:DataTypes.BOOLEAN,
    defaultValue: false
  },failed_farmer_load:{
    type:DataTypes.BOOLEAN,
    defaultValue: false
  },
  
 
});

ExportData.sync();
export default ExportData;