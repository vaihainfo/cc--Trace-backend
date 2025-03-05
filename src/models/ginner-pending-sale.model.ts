import { DataTypes } from 'sequelize';
import db from '../util/dbConn';



const ExportGinnerPending = db.define('export_ginner_pending_sales', {
  id: {
    type: DataTypes.INTEGER,
    autoIncrement: true,
    allowNull: false,
    primaryKey: true
  },
  date:{
    allowNull: true,
    type: DataTypes.DATE,
  },
  season:{
    allowNull: true,
    type: DataTypes.STRING,
  },ginner:{
    allowNull: true,
    type: DataTypes.STRING,
  },invoice:{
    allowNull: true,
    type: DataTypes.STRING,
  },buyer:{
    allowNull: true,
    type: DataTypes.STRING,
  },lot_no:{
    allowNull: true,
    type: DataTypes.STRING,
  },reel_lot_no:{
    allowNull: true,
    type: DataTypes.STRING,
  },no_of_bales:{
    allowNull: true,
    type: DataTypes.INTEGER,
  },press_no:{
    allowNull: true,
    type: DataTypes.STRING,
  },rate:{
    allowNull: true,
    type: DataTypes.STRING,
  },
  total_qty:{
    allowNull: true,
    type: DataTypes.INTEGER,
  },program:{
    allowNull: true,
    type: DataTypes.STRING,
  },status:{
    allowNull: true,
    type: DataTypes.STRING,
  },
 countryId:{
    allowNull: true,
    type: DataTypes.INTEGER,
 },
 brandId:{
    allowNull: true,
    type: DataTypes.INTEGER,
 },ginnerId:{
    allowNull: true,
    type: DataTypes.INTEGER,
 },seasonId:{
    allowNull: true,
    type: DataTypes.INTEGER,
 },
 programId:{
    allowNull: true,
    type: DataTypes.INTEGER,
 },
 createdAt:{
    allowNull: false,
    type: DataTypes.DATE,
 },
  updatedAt: {
    allowNull: false,
    type: DataTypes.DATE,
  },

});

ExportGinnerPending.sync();
export default ExportGinnerPending;