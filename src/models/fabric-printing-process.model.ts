import { DataTypes } from 'sequelize';
import db from '../util/dbConn';
import Fabric from './fabric.model';

const FabricPrintingProcess = db.define('fabric_printing_processes', {
  id: {
    type: DataTypes.INTEGER,
    autoIncrement: true,
    allowNull: false,
    primaryKey: true
  },
  fabric_id: {
    allowNull: false,
    foreignKey: true,
    type: DataTypes.INTEGER,
    references: { model: 'fabrics', key: 'id' },
    onDelete: 'CASCADE',
  },
  season_id: {
    allowNull: false,
    type: DataTypes.INTEGER
  },
  date: {
    allowNull: false,
    type: DataTypes.DATE
  },
  program: {
    allowNull: false,
    type: DataTypes.STRING
  },
  order_ref: {
    type: DataTypes.STRING
  },
  choosen_buyer: {
    allowNull: false,
    type: DataTypes.STRING
  },
  buyer_name: {
    type: DataTypes.STRING
  },
  processor_name: {
    type: DataTypes.STRING
  },
  processor_address: {
    type: DataTypes.STRING
  },
  qty_kgs: {
    allowNull: false,
    type: DataTypes.DOUBLE
  },
  qty_woven_fabric: {
    allowNull: false,
    type: DataTypes.DOUBLE
  },
  process_weight: {
    allowNull: false,
    type: DataTypes.STRING
  },
  weight_gain_percent: {
    type: DataTypes.INTEGER
  },
  weight_loss_percent: {
    type: DataTypes.INTEGER
  },
  printing_details: {
    type: DataTypes.STRING
  },
  printing_type: {
    allowNull: false,
    type: DataTypes.STRING
  },
  printed_fabric_length: {
    allowNull: false,
    type: DataTypes.STRING
  },
  printed_fabric_gsm: {
    allowNull: false,
    type: DataTypes.STRING
  },
  printed_fabric_net_weight: {
    type: DataTypes.STRING
  },
  batch_lot_no: {
    allowNull: false,
    type: DataTypes.STRING
  },
  job_details_garment: {
    type: DataTypes.STRING
  },
  invoice_no: {
    type: DataTypes.STRING
  },
  order_details: {
    type: DataTypes.STRING
  },
  uploaded_pattern: {
    type: DataTypes.STRING
  },
  bill_of_ladding: {
    type: DataTypes.STRING
  },
  transport_info: {
    type: DataTypes.STRING
  },
  status: {
    type: DataTypes.STRING
  }
});

FabricPrintingProcess.belongsTo(Fabric, {
  foreignKey: "fabric_id",
  as: "fabric_print_process",
});

FabricPrintingProcess.sync();

export default FabricPrintingProcess;
