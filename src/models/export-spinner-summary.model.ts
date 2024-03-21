import { DataTypes } from 'sequelize';
import db from '../util/dbConn';



const ExportSpinnerSummary = db.define('export_spinner_summaries', {
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

  lint_cotton_procured:{
    allowNull: true,
    type: DataTypes.STRING,
  },lint_cotton_procured_pending:{
    allowNull: true,
    type: DataTypes.STRING,
  },lint_consumed:{
    allowNull: true,
    type: DataTypes.STRING,
  },balance_lint_cotton:{
    allowNull: true,
    type: DataTypes.STRING,
  },yarn_procured:{
    allowNull: true,
    type: DataTypes.STRING,
  },yarn_sold:{
    allowNull: true,
    type: DataTypes.STRING,
  },yarn_stock:{
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

ExportSpinnerSummary.sync();
export default ExportSpinnerSummary;