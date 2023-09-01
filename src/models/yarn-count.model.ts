import { DataTypes  } from 'sequelize';
import db  from '../util/dbConn';

const YarnCount = db.define('yarn_counts',{
  id: {
    type: DataTypes.INTEGER,
    autoIncrement: true,
    allowNull: false,
    primaryKey: true
  },
  yarnCount_name: {
    type: DataTypes.STRING,
    allowNull: false,
  },
  yarnCount_status: {
    type: DataTypes.BOOLEAN,
    allowNull: false,
    defaultValue: true,
  },
});

export default YarnCount;