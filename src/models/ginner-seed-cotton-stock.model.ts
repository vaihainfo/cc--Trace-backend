import { DataTypes } from 'sequelize';
import db from '../util/dbConn';



const ExportGinnerCottonStock = db.define('export_ginner_cotton_stocks', {
  id: {
    type: DataTypes.INTEGER,
    autoIncrement: true,
    allowNull: false,
    primaryKey: true
  },
 
  season:{
    allowNull: true,
    type: DataTypes.STRING,
  },ginner:{
    allowNull: true,
    type: DataTypes.STRING,
  },cotton_procured:{
    allowNull: true,
    type: DataTypes.INTEGER,
  },cotton_processed:{
    allowNull: true,
    type: DataTypes.INTEGER,
  },cotton_stock:{
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

ExportGinnerCottonStock.sync();
export default ExportGinnerCottonStock;