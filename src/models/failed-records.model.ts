import { DataTypes  } from 'sequelize';
import db  from '../util/dbConn';
import Season from './season.model';
import Ginner from './ginner.model';

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
  ginner_id:{
    type: DataTypes.INTEGER,
  },
});

FailedRecords.belongsTo(Season, {
  foreignKey: "season_id",
  as: "season",
});
FailedRecords.belongsTo(Ginner, {
  foreignKey: "ginner_id",
  as: "ginner",
});

FailedRecords.sync();

export default FailedRecords;