import { DataTypes } from 'sequelize';
import db from '../util/dbConn';



const ExportSpinnerYarnSales = db.define('export_spinner_yarn_sales', {
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
  },spinner:{
    allowNull: true,
    type: DataTypes.STRING,
  },
  buyer_id:{
    allowNull: true,
    type: DataTypes.STRING,
  },
  invoice:{
    allowNull: true,
    type: DataTypes.STRING,
  },
  
  lotNo:{
    allowNull: true,
    type: DataTypes.STRING,
  },order_ref:{
    allowNull: true,
    type: DataTypes.STRING,
  },reelLot:{
    allowNull: true,
    type: DataTypes.STRING,
  },count:{
    allowNull: true,
    type: DataTypes.STRING,
  },boxes:{
    allowNull: true,
    type: DataTypes.STRING,
  },
  boxId:{
    allowNull: true,
    type: DataTypes.STRING,
  },
  price:{
    allowNull: true,
    type: DataTypes.STRING,
  },
  total:{
    allowNull: true,
    type: DataTypes.STRING,
  },
  transporter_name:{
    allowNull: true,
    type: DataTypes.STRING,
  },
  vehicle_no:{
    allowNull: true,
    type: DataTypes.STRING,
  },
  agent:{
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

ExportSpinnerYarnSales.sync();
export default ExportSpinnerYarnSales;