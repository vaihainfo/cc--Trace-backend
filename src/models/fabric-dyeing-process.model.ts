import { DataTypes  } from 'sequelize';
import db  from '../util/dbConn';
import Fabric from './fabric.model';

const FabricDyeingProcess = db.define('fabric_dyeing_processes',{
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
  dying_details: {
    allowNull: false,
    type: DataTypes.STRING
  },
  dying_color: {
    type: DataTypes.STRING
  },
  dyed_fabric_length: {
    allowNull: false,
    type: DataTypes.STRING
  },
  dyed_fabric_gsm: {
    allowNull: false,
    type: DataTypes.STRING
  },
  dyed_fabric_net_weight: {
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
  },
});

FabricDyeingProcess.belongsTo(Fabric, {
  foreignKey: "fabric_id",
  as: "fabric_dye_process",
});


FabricDyeingProcess.sync();

export default FabricDyeingProcess;