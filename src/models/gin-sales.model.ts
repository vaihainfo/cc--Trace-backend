import { DataTypes } from 'sequelize';
import db from '../util/dbConn';

import Ginner from './ginner.model';
import Season from './season.model';
import Program from './program.model';
import Spinner from './spinner.model';

const GinSales = db.define('gin_sales', {
  id: {
    type: DataTypes.INTEGER,
    autoIncrement: true,
    allowNull: false,
    primaryKey: true
  },
  ginner_id: {
    type: DataTypes.INTEGER,
    foreignKey: true,
    references: { model: 'ginners', key: 'id' },
    onDelete: 'CASCADE',
    allowNull: false,
  },
  season_id: {
    allowNull: false,
    type: DataTypes.INTEGER
  },
  date: {
    allowNull: false,
    type: DataTypes.DATE
  },
  program_id: {
    allowNull: false,
    type: DataTypes.INTEGER
  },
  total_qty: {
    type: DataTypes.DOUBLE
  },
  no_of_bales: {
    type: DataTypes.INTEGER
  },
  choosen_bale: {
    type: DataTypes.STRING
  },
  lot_no: {
    type: DataTypes.STRING
  },
  buyer: {
    type: DataTypes.INTEGER
  },
  shipping_address: {
    allowNull: false,
    type: DataTypes.STRING
  },
  transaction_via_trader: {
    allowNull: false,
    type: DataTypes.BOOLEAN
  },
  transaction_agent: {
    type: DataTypes.STRING
  },
  tc_file: {
    type: DataTypes.STRING
  },
  contract_file: {
    type: DataTypes.STRING
  },
  invoice_file: {
    type: DataTypes.ARRAY(DataTypes.TEXT)
  },
  delivery_notes: {
    type: DataTypes.STRING
  },
  candy_rate: {
    allowNull: false,
    type: DataTypes.STRING
  },
  rate: {
    allowNull: false,
    type: DataTypes.STRING
  },
  sale_value: {
    type: DataTypes.STRING
  },
  invoice_no: {
    type: DataTypes.STRING
  },
  despatch_from: {
    allowNull: false,
    type: DataTypes.STRING
  },
  despatch_to: {
    type: DataTypes.STRING
  },
  status: {
    type: DataTypes.STRING
  },
  qr: {
    type: DataTypes.STRING
  },
  weight_loss: {
    type: DataTypes.BOOLEAN
  },
  transporter_name: {
    type: DataTypes.STRING
  },
  vehicle_no: {
    type: DataTypes.STRING
  },
  lrbl_no: {
    type: DataTypes.STRING
  },
  place_of_supply: {
    type: DataTypes.STRING
  },
  gst_number: {
    type: DataTypes.STRING
  },
  gst_percentage: {
    type: DataTypes.STRING
  },
  gross_weight: {
    type: DataTypes.STRING
  },
  tare_weight: {
    type: DataTypes.STRING
  },
  less_weight: {
    type: DataTypes.STRING
  },
  sample: {
    type: DataTypes.STRING
  },
  accept_date: {
    type: DataTypes.DATE
  },
  press_no: {
    type: DataTypes.STRING
  },
  reel_lot_no: {
    type: DataTypes.STRING
  },
  qty_stock: {
    type: DataTypes.DOUBLE
  },
  greyout_status: {
    type: DataTypes.BOOLEAN,
    defaultValue: false,
  },
  visible_flag: {
    type: DataTypes.BOOLEAN,
    defaultValue: true,
  },
  accepted_bales_weight: {
    type: DataTypes.DOUBLE
  },
  letter_of_credit: {
    type: DataTypes.ARRAY(DataTypes.TEXT)
  },
  logistics_documents: {
    type: DataTypes.ARRAY(DataTypes.TEXT)
  },
  te_verified_status: {
    type: DataTypes.BOOLEAN,
  },
  te_verified_total_qty: {
    type: DataTypes.DOUBLE,
  },
  te_verified_bales: {
    type: DataTypes.DOUBLE,
  },
  be_verified_status: {
    type: DataTypes.BOOLEAN,
  },
  be_verified_total_qty: {
    type: DataTypes.DOUBLE,
  },
  be_verified_bales: {
    type: DataTypes.DOUBLE,
  },
  spin_verified_status: {
    type: DataTypes.BOOLEAN,
  },
  spin_verified_total_qty: {
    type: DataTypes.DOUBLE,
  },
  spin_verified_bales: {
    type: DataTypes.DOUBLE,
  },
  bm_verified_status: {
    type: DataTypes.BOOLEAN,
  },
  bm_verified_total_qty: {
    type: DataTypes.DOUBLE,
  },
  bm_verified_bales: {
    type: DataTypes.DOUBLE,
  },
  ps_verified_status: {
    type: DataTypes.BOOLEAN,
  },
  ps_verified_total_qty: {
    type: DataTypes.DOUBLE,
  },
  ps_verified_bales: {
    type: DataTypes.DOUBLE,
  },
  buyer_type: {
    type: DataTypes.STRING,
  },
  buyer_ginner: {
    type: DataTypes.INTEGER,
  },
  verification_status: {
    type: DataTypes.STRING
  },
});

GinSales.belongsTo(Ginner, {
  foreignKey: "ginner_id",
  as: "ginner",
});

GinSales.belongsTo(Spinner, {
  foreignKey: "buyer",
  as: "buyerdata",
});

GinSales.belongsTo(Ginner, {
  foreignKey: "buyer_ginner",
  as: "buyerdata_ginner",
});


GinSales.belongsTo(Season, {
  foreignKey: "season_id",
  as: "season",
});

GinSales.belongsTo(Program, {
  foreignKey: "program_id",
  as: "program",
});

GinSales.sync();

export default GinSales;