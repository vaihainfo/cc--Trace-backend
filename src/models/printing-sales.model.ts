import { DataTypes } from 'sequelize';
import db from '../util/dbConn';
import Garment from './garment.model';
import Fabric from './fabric.model';
import Season from './season.model';
import Program from './program.model';

const PrintingSales = db.define('printing_sales', {
  id: {
    allowNull: false,
    autoIncrement: true,
    primaryKey: true,
    type: DataTypes.INTEGER
  },
  season_id: {
    type: DataTypes.INTEGER
  },
  printing_id: {
    type: DataTypes.INTEGER
  },
  date: {
    type: DataTypes.DATE
  },
  program_id: {
    type: DataTypes.INTEGER
  },
  brand_order_ref: {
    type: DataTypes.STRING
  },
  garment_order_ref: {
    type: DataTypes.STRING
  },
  buyer_type: {
    type: DataTypes.ENUM('Compacting', 'Garment', 'New'),
  },
  buyer_id: {
    type: DataTypes.INTEGER
  },
  fabric_id: {
    type: DataTypes.INTEGER
  },
  processor_name: {
    type: DataTypes.STRING
  },
  processor_address: {
    type: DataTypes.STRING
  },
  fabric_quantity: {
    type: DataTypes.DOUBLE
  },
  old_fabric_quantity: {
    type: DataTypes.DOUBLE,
    defaultValue: 0
  },
  add_fabric_quantity: {
    type: DataTypes.DOUBLE
  },
  total_fabric_quantity: {
    type: DataTypes.DOUBLE
  },
  fabric_type: {
    type: DataTypes.STRING
  },
  fabric_length: {
    type: DataTypes.DOUBLE
  },
  gsm: {
    type: DataTypes.STRING
  },
  fabric_net_weight: {
    type: DataTypes.DOUBLE
  },
  batch_lot_no: {
    type: DataTypes.STRING
  },
  job_details: {
    type: DataTypes.STRING
  },
  print_type: {
    type: DataTypes.STRING
  },
  upload_patter_from_garment: {
    type: DataTypes.STRING
  },
  invoice_no: {
    type: DataTypes.STRING
  },
  order_details: {
    type: DataTypes.STRING
  },
  bill_of_lading: {
    type: DataTypes.STRING
  },
  transport_info: {
    type: DataTypes.STRING
  },
  qty_stock: {
    type: DataTypes.DOUBLE
  },
  status: {
    type: DataTypes.STRING
  },
  printing_details: {
    type: DataTypes.STRING
  },
  printing_pattern: {
    type: DataTypes.STRING
  },
  weight_gain: {
    type: DataTypes.STRING
  },
  weight_loss: {
    type: DataTypes.STRING
  },
  accept_date: {
    type: DataTypes.DATE
  },
  qr: {
    type: DataTypes.STRING
  },
  invoice_files: {
    type: DataTypes.ARRAY(DataTypes.STRING)
  },
  other_docs: {
    type: DataTypes.ARRAY(DataTypes.STRING)
  },
  sales_type: {
    type: DataTypes.STRING
  },
  from_date: {
    type: DataTypes.DATE,
    allowNull: true,
    defaultValue: null,
  },
  to_date: {
    type: DataTypes.DATE,
    allowNull: true,
    defaultValue: null,
  },
});

PrintingSales.belongsTo(Fabric, {
  foreignKey: "printing_id",
  as: "printing",
});

PrintingSales.belongsTo(Program, {
  foreignKey: "program_id",
  as: "program",
});

PrintingSales.belongsTo(Season, {
  foreignKey: "season_id",
  as: "season",
});


PrintingSales.belongsTo(Fabric, {
  foreignKey: "fabric_id",
  as: "abuyer",
});


PrintingSales.belongsTo(Garment, {
  foreignKey: "buyer_id",
  as: "buyer",
});

PrintingSales.sync();

export default PrintingSales;