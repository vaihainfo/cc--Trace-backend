import { DataTypes } from 'sequelize';
import db from '../util/dbConn';

import Garment from './garment.model';
import Program from './program.model';
import Season from './season.model';
import Brand from './brand.model';
import Trader from './trader.model';

const GarmentSales = db.define('garment_sales', {
  id: {
    type: DataTypes.INTEGER,
    autoIncrement: true,
    allowNull: false,
    primaryKey: true
  },
  garment_id: {
    type: DataTypes.INTEGER,
    foreignKey: true,
    references: { model: 'garments', key: 'id' },
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
  department_id: {
    allowNull: false,
    type: DataTypes.ARRAY(DataTypes.INTEGER)
  },
  fabric_order_ref: {
    type: DataTypes.STRING
  },
  brand_order_ref: {
    type: DataTypes.STRING
  },
  buyer_type: {
    allowNull: false,
    type: DataTypes.STRING
  },
  buyer_id: {
    type: DataTypes.INTEGER
  },
  trader_id: {
    type: DataTypes.INTEGER
  },
  processor_name: {
    type: DataTypes.STRING
  },
  processor_address: {
    type: DataTypes.STRING
  },
  total_no_of_pieces: {
    type: DataTypes.DOUBLE
  },
  total_no_of_boxes: {
    type: DataTypes.DOUBLE
  },
  fabric_length: {
    type: DataTypes.DOUBLE
  },
  total_fabric_length: {
    type: DataTypes.DOUBLE
  },
  fabric_weight: {
    type: DataTypes.DOUBLE
  },
  total_fabric_weight: {
    type: DataTypes.DOUBLE
  },
  transaction_via_trader: {
    allowNull: false,
    type: DataTypes.BOOLEAN
  },
  transaction_agent: {
    type: DataTypes.STRING
  },
  garment_type: {
    type: DataTypes.ARRAY(DataTypes.STRING)
  },
  style_mark_no: {
    type: DataTypes.ARRAY(DataTypes.STRING)
  },
  invoice_no: {
    type: DataTypes.STRING
  },
  bill_of_ladding: {
    type: DataTypes.STRING
  },
  transportor_name: {
    type: DataTypes.STRING
  },
  contract_no: {
    type: DataTypes.STRING
  },
  tc_file: {
    type: DataTypes.STRING
  },
  contract_file: {
    type: DataTypes.STRING
  },
  invoice_files: {
    type: DataTypes.ARRAY(DataTypes.STRING)
  },
  delivery_notes: {
    type: DataTypes.STRING
  },
  qty_stock: {
    type: DataTypes.DOUBLE
  },
  qty_stock_pieces: {
    type: DataTypes.DOUBLE
  },
  qty_stock_boxes: {
    type: DataTypes.DOUBLE
  },
  qty_stock_length: {
    type: DataTypes.DOUBLE
  },
  qty_stock_weight: {
    type: DataTypes.DOUBLE
  },
  shipment_address: {
    type: DataTypes.STRING
  },
  vehicle_no: {
    type: DataTypes.STRING
  },
  status: {
    type: DataTypes.STRING
  },
  accept_date: {
    type: DataTypes.DATE
  },
  qr: {
    type: DataTypes.STRING
  },
  coc_doc: {
    type: DataTypes.STRING
  },
  garment_size: {
    type: DataTypes.ARRAY(DataTypes.STRING)
  },
  color: {
    type: DataTypes.ARRAY(DataTypes.STRING)
  },
  no_of_pieces: {
    type: DataTypes.ARRAY(DataTypes.INTEGER)
  },
  no_of_boxes: {
    type: DataTypes.ARRAY(DataTypes.INTEGER)
  },
});

GarmentSales.belongsTo(Garment, {
  foreignKey: "garment_id",
  as: "garment",
});

GarmentSales.belongsTo(Program, {
  foreignKey: "program_id",
  as: "program",
});

// GarmentSales.belongsTo(Department, {
//   foreignKey: "department_id",
//   as: "department",
// });

GarmentSales.belongsTo(Season, {
  foreignKey: "season_id",
  as: "season",
});

GarmentSales.belongsTo(Trader, {
  foreignKey: "trader_id",
  as: "trader",
});


GarmentSales.belongsTo(Brand, {
  foreignKey: "buyer_id",
  as: "buyer",
});

GarmentSales.sync();

export default GarmentSales;