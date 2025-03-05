import { DataTypes } from 'sequelize';
import db from '../util/dbConn';

const LinenDetails = db.define('linen_details', {
  id: {
    type: DataTypes.INTEGER,
    autoIncrement: true,
    allowNull: false,
    primaryKey: true
  },
  season_id: {
    type: DataTypes.INTEGER
  },
  harvest: {
    type: DataTypes.STRING
  },
  farmer_no: {
    type: DataTypes.STRING
  },
  farmer_name: {
    type: DataTypes.STRING
  },
  country: {
    type: DataTypes.STRING
  },
  town: {
    type: DataTypes.STRING
  },
  department: {
    type: DataTypes.STRING
  },
  area: {
    type: DataTypes.STRING
  },
  linen_variety: {
    type: DataTypes.STRING
  },
  cooperative_name: {
    type: DataTypes.STRING
  },
  no_of_bales: {
    type: DataTypes.INTEGER
  },
  farm_lot_no: {
    type: DataTypes.STRING
  },
  total_weight: {
    type: DataTypes.STRING
  },
  scutch_date: {
    type: DataTypes.DATE
  },
  scutching_lot_no: {
    type: DataTypes.STRING
  },
  bales_after_scutching: {
    type: DataTypes.INTEGER
  },
  weight_after_scutching: {
    type: DataTypes.DOUBLE
  },
  shipment_date: {
    type: DataTypes.DATE
  },
  shipment_details: {
    type: DataTypes.TEXT
  },
  shiped_to: {
    type: DataTypes.TEXT
  },
  qty_stock: {
    type: DataTypes.DOUBLE
  },
  program_id: {
    type: DataTypes.INTEGER
  },
  status: {
    type: DataTypes.STRING
  },
});

export default LinenDetails;