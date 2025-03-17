import { DataTypes } from 'sequelize';
import db from '../util/dbConn';

const SpinCombernoilSale = db.define('spin_combernoil_sales', {
  id: {
    allowNull: false,
    autoIncrement: true,
    primaryKey: true,
    type: DataTypes.INTEGER
  },
  season_id: {
    type: DataTypes.INTEGER,
    allowNull: false
  },
  spinner_id: {
    type: DataTypes.INTEGER,
    allowNull: false
  },
  comber_ids: {
    type: DataTypes.ARRAY(DataTypes.INTEGER),
    allowNull: true
  },
  sale_type: {
    type: DataTypes.STRING,
    allowNull: true
  },
  date: {
    type: DataTypes.DATE,
    allowNull: false
  },
  program_id: {
    type: DataTypes.INTEGER,
    allowNull: true
  },
  order_ref: {
    type: DataTypes.STRING,
    allowNull: true
  },
  buyer_type: {
    type: DataTypes.STRING,
    allowNull: true
  },
  buyer_id: {
    type: DataTypes.INTEGER,
    allowNull: false
  },
  processor_name: {
    type: DataTypes.STRING,
    allowNull: true
  },
  processor_address: {
    type: DataTypes.TEXT,
    allowNull: true
  },
  trader_id: {
    type: DataTypes.INTEGER,
    allowNull: true
  },
  transaction_via_trader: {
    type: DataTypes.BOOLEAN,
    defaultValue: false
  },
  transaction_agent: {
    type: DataTypes.STRING,
    allowNull: true
  },
  total_qty: {
    type: DataTypes.DOUBLE,
    allowNull: true
  },
  batch_lot_no: {
    type: DataTypes.STRING,
    allowNull: true
  },
  reel_lot_no: {
    type: DataTypes.STRING,
    allowNull: true
  },
  invoice_no: {
    type: DataTypes.STRING,
    allowNull: true
  },
  bill_of_ladding: {
    type: DataTypes.STRING,
    allowNull: true
  },
  transporter_name: {
    type: DataTypes.STRING,
    allowNull: true
  },
  vehicle_no: {
    type: DataTypes.STRING,
    allowNull: true
  },
  quality_doc: {
    type: DataTypes.STRING,
    allowNull: true
  },
  tc_files: {
    type: DataTypes.STRING,
    allowNull: true
  },
  contract_file: {
    type: DataTypes.STRING,
    allowNull: true
  },
  invoice_file: {
    type: DataTypes.ARRAY(DataTypes.TEXT)
  },
  delivery_notes: {
    type: DataTypes.TEXT,
    allowNull: true
  },
  qty_stock: {
    type: DataTypes.DOUBLE,
    allowNull: false,
    defaultValue: 0
  },
  status: {
    type: DataTypes.STRING,
    allowNull: false,
    defaultValue: 'pending'
  },
  qr: {
    type: DataTypes.STRING,
    allowNull: true
  },
  accept_date: {
    type: DataTypes.DATE,
    allowNull: true
  },
  price: {
    type: DataTypes.DOUBLE,
    allowNull: true
  },
  submitted_by: {
    type: DataTypes.INTEGER,
    allowNull: true
  },
  accept_by: {
    type: DataTypes.INTEGER,
    allowNull: true
  },
  letter_of_credit: {
    type: DataTypes.ARRAY(DataTypes.TEXT)
  },
  logistics_documents: {
    type: DataTypes.ARRAY(DataTypes.TEXT)
  },
  yarn_quality_test_reports: {
    type: DataTypes.ARRAY(DataTypes.TEXT)
  }
 
}, {
  timestamps: true // This will handle createdAt and updatedAt automatically
});

SpinCombernoilSale.sync();

export default SpinCombernoilSale;