import { DataTypes } from 'sequelize';
import db from '../util/dbConn';



const ExportSpinnerLintStock = db.define('export_spinner_lint_stocks', {
  id: {
    type: DataTypes.INTEGER,
    autoIncrement: true,
    allowNull: false,
    primaryKey: true
  },
  
  spinner:{
    allowNull: true,
    type: DataTypes.STRING,
  },

  season:{
    allowNull: true,
    type: DataTypes.STRING,
  },batch_lot_no:{
    allowNull: true,
    type: DataTypes.STRING,
  },reel_lot_no:{
    allowNull: true,
    type: DataTypes.STRING,
  },invoice_no:{
    allowNull: true,
    type: DataTypes.STRING,
  },cotton_procured:{
    allowNull: true,
    type: DataTypes.STRING,
  },cotton_consumed:{
    allowNull: true,
    type: DataTypes.STRING,
  },cotton_stock:{
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

ExportSpinnerLintStock.sync();
export default ExportSpinnerLintStock;