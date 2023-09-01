import { DataTypes  } from 'sequelize';
import db  from '../util/dbConn';

import Spinner from './spinner.model';

const SpinSales = db.define('spin_sales',{
  id: {
    type: DataTypes.INTEGER,
    autoIncrement: true,
    allowNull: false,
    primaryKey: true
  },
  spinner_id: {
    type: DataTypes.INTEGER,
    foreignKey: true,
    references: { model: 'spinners', key: 'id' },
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
  order_ref: {
    type: DataTypes.STRING
  },
  buyer_type: {
    allowNull: false,
    type: DataTypes.STRING
  },
  buyer_id: {
    type: DataTypes.INTEGER
  },
  processor_name: {
    type: DataTypes.STRING
  },
  processor_address: {
    type: DataTypes.STRING
  },
  trader_id: {
    type: DataTypes.INTEGER
  },
  transaction_via_trader: {
    allowNull: false,
    type: DataTypes.BOOLEAN
  },
  transaction_agent: {
    type: DataTypes.STRING
  },
  total_qty: {
    type: DataTypes.DOUBLE
  },
  no_of_boxes: {
    type: DataTypes.INTEGER
  },
  batch_lot_no: {
    allowNull: false,
    type: DataTypes.STRING
  },
  reel_lot_no: {
    type: DataTypes.STRING
  },
  box_ids: {
    type: DataTypes.STRING
  },
  yarn_type: {
    type: DataTypes.STRING
  },
  yarn_count: {
    type: DataTypes.DOUBLE
  },
  invoice_no: {
    allowNull: false,
    type: DataTypes.STRING
  },
  bill_of_ladding: {
    allowNull: false,
    type: DataTypes.STRING
  },
  transporter_name: {
    allowNull: false,
    type: DataTypes.STRING
  },
  vehicle_no: {
    allowNull: false,
    type: DataTypes.STRING
  },
  quality_doc: {
    type: DataTypes.STRING
  },
  tc_files: {
    type: DataTypes.STRING
  },
  contract_file: {
    type: DataTypes.STRING
  },
  invoice_file: {
    type: DataTypes.STRING
  },
  delivery_notes: {
    type: DataTypes.STRING
  },
  qty_stock: {
    type: DataTypes.DOUBLE
  },
  status: {
    type: DataTypes.STRING
  },
});

SpinSales.belongsTo(Spinner, {
  foreignKey: "spinner_id",
  as: "spinner",
});

SpinSales.sync();

export default SpinSales;