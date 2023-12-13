import { DataTypes } from 'sequelize';
import db from '../util/dbConn';
import Garment from './garment.model';
import Fabric from './fabric.model';
import Season from './season.model';
import Program from './program.model';

const WashingSales = db.define('washing_sales', {
  id: {
    allowNull: false,
    autoIncrement: true,
    primaryKey: true,
    type: DataTypes.INTEGER
  },
  season_id: {
    type: DataTypes.INTEGER
  },
  washing_id: {
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
    type: DataTypes.ENUM('Printing', 'Compacting', 'Garment', 'New'),
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
  wash_type: {
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
  washing_details: {
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
  }
});

WashingSales.belongsTo(Fabric, {
  foreignKey: "washing_id",
  as: "washing",
});

WashingSales.belongsTo(Program, {
  foreignKey: "program_id",
  as: "program",
});

WashingSales.belongsTo(Season, {
  foreignKey: "season_id",
  as: "season",
});


WashingSales.belongsTo(Fabric, {
  foreignKey: "fabric_id",
  as: "abuyer",
});


WashingSales.belongsTo(Garment, {
  foreignKey: "buyer_id",
  as: "buyer",
});

WashingSales.sync();

export default WashingSales;