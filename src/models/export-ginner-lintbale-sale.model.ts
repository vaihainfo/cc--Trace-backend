import { DataTypes } from 'sequelize';
import db from '../util/dbConn';



const ExportGinnerSale = db.define('export_ginner_lintbale_sales', {
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
created_at:{
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
  },heap:{
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
  },
  rate:{
    allowNull: true,
    type: DataTypes.STRING,
  },
  lint_quantity:{
    allowNull: true,
    type: DataTypes.INTEGER,
  },sales_value:{
    allowNull: true,
    type: DataTypes.STRING,
  },vehicle_no:{
    allowNull: true,
    type: DataTypes.STRING,
  },transporter_name:{
    allowNull: true,
    type: DataTypes.STRING,
  },program:{
    allowNull: true,
    type: DataTypes.STRING,
  },agentDetails:{
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
//  createdAt:{
//     allowNull: false,
//     type: DataTypes.DATE,
//  },
//   updatedAt: {
//     allowNull: false,
//     type: DataTypes.DATE,
//   },

});

ExportGinnerSale.sync();
export default ExportGinnerSale;