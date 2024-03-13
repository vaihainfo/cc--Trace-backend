import { DataTypes } from 'sequelize';
import db from '../util/dbConn';



const ExportGinnerProcess = db.define('export_ginner_lintbale_processes', {
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
    type: DataTypes.STRING,
  },press_no:{
    allowNull: true,
    type: DataTypes.STRING,
  },rate:{
    allowNull: true,
    type: DataTypes.STRING,
  },total_qty:{
    allowNull: true,
    type: DataTypes.STRING,
  },program:{
    allowNull: true,
    type: DataTypes.STRING,
  },
  status:{
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
 created_date:{
    allowNull: true,
    type: DataTypes.STRING,
 },
 process_no:{
    allowNull: true,
    type: DataTypes.STRING,
 },
 lint_qty:{
    allowNull: true,
    type: DataTypes.STRING,
 },
 seedConsmed:{
    allowNull: true,
    type: DataTypes.STRING,
 },
 got:{
    allowNull: true,
    type: DataTypes.STRING,
 },
 lint_quantity_sold:{
    allowNull: true,
    type: DataTypes.STRING,
 },
 sold_bales:{
    allowNull: true,
    type: DataTypes.STRING,
 },
 lint_stock:{
    allowNull: true,
    type: DataTypes.STRING,
 },
 bale_stock:{
    allowNull: true,
    type: DataTypes.STRING,
 },
 village:{
    allowNull: true,
    type: DataTypes.STRING,
 }, createdAt: {
    allowNull: false,
    type: DataTypes.DATE,
  },
  updatedAt: {
    allowNull: false,
    type: DataTypes.DATE,
  },

});

ExportGinnerProcess.sync();
export default ExportGinnerProcess;