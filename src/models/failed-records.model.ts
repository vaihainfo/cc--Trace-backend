import { DataTypes  } from 'sequelize';
import db  from '../util/dbConn';
import Season from './season.model';

const FailedRecords = db.define('failed_records', {
  id: {
    type: DataTypes.INTEGER,
    autoIncrement: true,
    allowNull: false,
    primaryKey: true
  },
  season_id: {
    type: DataTypes.INTEGER,
  },
  type: {
    type: DataTypes.STRING,
    allowNull: false,
  },
  farmer_code: {
    type: DataTypes.STRING,
  },
  farmer_name: {
    type: DataTypes.STRING,
  },
  reason:{
    type: DataTypes.TEXT,
  },
  body:{
    type: DataTypes.JSON,
  },
});

FailedRecords.belongsTo(Season, {
  foreignKey: "season_id",
  as: "season",
});

FailedRecords.sync();

export default FailedRecords;