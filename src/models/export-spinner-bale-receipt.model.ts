import { DataTypes } from 'sequelize';
import db from '../util/dbConn';



const ExportSpinnerBaleReceipt = db.define('export_spinner_bale_receipts', {
  id: {
    type: DataTypes.INTEGER,
    autoIncrement: true,
    allowNull: false,
    primaryKey: true
  },
  
  accept_date:{
    allowNull: true,
    type: DataTypes.STRING,
  },

  date:{
    allowNull: true,
    type: DataTypes.STRING,
  },season:{
    allowNull: true,
    type: DataTypes.STRING,
  },spinner:{
    allowNull: true,
    type: DataTypes.STRING,
  },ginner:{
    allowNull: true,
    type: DataTypes.STRING,
  },invoice:{
    allowNull: true,
    type: DataTypes.STRING,
  },lot_no:{
    allowNull: true,
    type: DataTypes.STRING,
  },reel_lot_no:{
    allowNull: true,
    type: DataTypes.STRING,
  },
  press_no:{
    allowNull: true,
    type: DataTypes.STRING,
  },
  no_of_bales:{
    allowNull: true,
    type: DataTypes.STRING,
  },
  lint_quantity:{
    allowNull: true,
    type: DataTypes.STRING,
  },
  program:{
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

ExportSpinnerBaleReceipt.sync();
export default ExportSpinnerBaleReceipt;