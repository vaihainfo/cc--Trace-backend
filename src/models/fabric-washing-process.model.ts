import { DataTypes } from 'sequelize';
import db from '../util/dbConn';
import Fabric from './fabric.model';

const FabricWashingProcess = db.define('fabric_washing_processes', {
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
  washing_details: {
    type: DataTypes.STRING
  },
  washing_type: {
    allowNull: false,
    type: DataTypes.STRING
  },
  washed_fabric_length: {
    allowNull: false,
    type: DataTypes.STRING
  },
  washed_fabric_gsm: {
    allowNull: false,
    type: DataTypes.STRING
  },
  washed_fabric_net_weight: {
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

FabricWashingProcess.belongsTo(Fabric, {
  foreignKey: "fabric_id",
  as: "fabric_wash_process",
});

FabricWashingProcess.sync();

export default FabricWashingProcess;
