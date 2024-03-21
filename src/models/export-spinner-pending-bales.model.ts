import { DataTypes } from 'sequelize';
import db from '../util/dbConn';



const ExportSpinnerPendingBales = db.define('export_spinner_pending_bales', {
  id: {
    type: DataTypes.INTEGER,
    autoIncrement: true,
    allowNull: false,
    primaryKey: true
  },
  
  date:{
    allowNull: true,
    type: DataTypes.STRING,
  },

  season:{
    allowNull: true,
    type: DataTypes.STRING,
  },buyer:{
    allowNull: true,
    type: DataTypes.STRING,
  },ginner:{
    allowNull: true,
    type: DataTypes.STRING,
  },invoice:{
    allowNull: true,
    type: DataTypes.STRING,
  },no_of_bales:{
    allowNull: true,
    type: DataTypes.STRING,
  },lot_no:{
    allowNull: true,
    type: DataTypes.STRING,
  },reel_lot_no:{
    allowNull: true,
    type: DataTypes.STRING,
  },
  total_qty:{
    allowNull: true,
    type: DataTypes.STRING,
  },
  actual_qty:{
    allowNull: true,
    type: DataTypes.STRING,
  },
  program:{
    allowNull: true,
    type: DataTypes.STRING,
  },
  village:{
    allowNull: true,
    type: DataTypes.STRING(1000),
  },
  ginnerId:{
    allowNull: true,
    type: DataTypes.INTEGER,
 },
 countryId:{
    allowNull: true,
    type: DataTypes.INTEGER,
 },
 brandId:{
    allowNull: true,
    type: DataTypes.INTEGER,
 },spinnerId:{
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

ExportSpinnerPendingBales.sync();
export default ExportSpinnerPendingBales;