import { DataTypes } from 'sequelize';
import db from '../util/dbConn';
import Garment from './garment.model';
import Fabric from './fabric.model';
import Season from './season.model';
import Program from './program.model';

const DyingSales = db.define('dying_sales', {
  id: {
    allowNull: false,
    autoIncrement: true,
    primaryKey: true,
    type: DataTypes.INTEGER
  },
  season_id: {
    type: DataTypes.INTEGER
  },
  dying_id: {
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
    type: DataTypes.ENUM('Washing', 'Printing', 'Compacting', 'Garment', 'New'),
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
  dying_details: {
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
  dying_color: {
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
  sales_type : {
    type: DataTypes.STRING
  },
  qr: {
    type: DataTypes.STRING
  },
  dye_invoice: {
    type: DataTypes.STRING
  },
  invoice_files: {
    type: DataTypes.ARRAY(DataTypes.STRING)
  },
  other_docs: {
    type: DataTypes.ARRAY(DataTypes.STRING)
  }
});

DyingSales.belongsTo(Fabric, {
  foreignKey: "dying_id",
  as: "dying_fabric",
});

DyingSales.belongsTo(Program, {
  foreignKey: "program_id",
  as: "program",
});

DyingSales.belongsTo(Season, {
  foreignKey: "season_id",
  as: "season",
});


DyingSales.belongsTo(Fabric, {
  foreignKey: "fabric_id",
  as: "abuyer",
});


DyingSales.belongsTo(Garment, {
  foreignKey: "buyer_id",
  as: "buyer",
});

DyingSales.sync();

export default DyingSales;