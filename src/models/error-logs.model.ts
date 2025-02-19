import { DataTypes  } from 'sequelize';
import db  from '../util/dbConn';

const ErrorLogs = db.define('error_logs',{
  id: {
    type: DataTypes.INTEGER,
    autoIncrement: true,
    allowNull: false,
    primaryKey: true
  },
  method: {
    type: DataTypes.STRING
  },
  api_url: {
    type: DataTypes.STRING
  },
  response_time: {
    type: DataTypes.STRING
  },
  status_code: {
    type: DataTypes.INTEGER
  },
  error_message: {
    type: DataTypes.TEXT
  },
  request_body: {
    type: DataTypes.JSON
  },
  sql_query: {
    type: DataTypes.TEXT
  },
});


export default ErrorLogs;