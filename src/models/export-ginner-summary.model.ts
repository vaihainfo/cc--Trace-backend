import { DataTypes } from 'sequelize';
import db from '../util/dbConn';



const ExportGinnerSummary = db.define('export_ginner_summaries', {
  id: {
    type: DataTypes.INTEGER,
    autoIncrement: true,
    allowNull: false,
    primaryKey: true
  },
  
  name:{
    allowNull: true,
    type: DataTypes.STRING,
  },

  cottonProcuredMt:{
    allowNull: true,
    type: DataTypes.STRING,
  },cottonProcessedeMt:{
    allowNull: true,
    type: DataTypes.STRING,
  },cottonStockMt:{
    allowNull: true,
    type: DataTypes.STRING,
  },lintProcuredMt:{
    allowNull: true,
    type: DataTypes.STRING,
  },lintSoldMt:{
    allowNull: true,
    type: DataTypes.STRING,
  },lintStockMt:{
    allowNull: true,
    type: DataTypes.INTEGER,
  },balesProduced:{
    allowNull: true,
    type: DataTypes.INTEGER,
  },balesSold:{
    allowNull: true,
    type: DataTypes.INTEGER,
  },balesStock:{
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

ExportGinnerSummary.sync();
export default ExportGinnerSummary;