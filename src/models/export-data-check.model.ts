import { DataTypes } from 'sequelize';
import db from '../util/dbConn';



const ExportData = db.define('export_data_checks', {
  id: {
    type: DataTypes.INTEGER,
    autoIncrement: true,
    allowNull: false,
    primaryKey: true
  },
  ginner_lint_bale_process_load:{
    type:DataTypes.BOOLEAN,
    defaultValue: false
  }
 
});


export default ExportData;