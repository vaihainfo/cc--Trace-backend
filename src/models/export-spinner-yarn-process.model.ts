import { DataTypes } from 'sequelize';
import db from '../util/dbConn';



const ExportSpinnerYarnProcess = db.define('export_spinner_yarn_processes', {
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
  },lotNo:{
    allowNull: true,
    type: DataTypes.STRING,
  },reel_lot_no:{
    allowNull: true,
    type: DataTypes.STRING,
  },yarnType:{
    allowNull: true,
    type: DataTypes.STRING,
  },count:{
    allowNull: true,
    type: DataTypes.STRING,
  },resa:{
    allowNull: true,
    type: DataTypes.STRING,
  },
  comber:{
    allowNull: true,
    type: DataTypes.STRING,
  },
  blend:{
    allowNull: true,
    type: DataTypes.STRING,
  },
  blendqty:{
    allowNull: true,
    type: DataTypes.STRING,
  },
  cotton_consumed:{
    allowNull: true,
    type: DataTypes.STRING,
  },
  program:{
    allowNull: true,
    type: DataTypes.STRING,
  },
  total:{
    allowNull: true,
    type: DataTypes.STRING,
  },
  yarn_sold:{
    allowNull: true,
    type: DataTypes.STRING,
  },
  yarn_stock:{
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

ExportSpinnerYarnProcess.sync();
export default ExportSpinnerYarnProcess;