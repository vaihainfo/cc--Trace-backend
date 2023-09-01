import { DataTypes  } from 'sequelize';
import db  from '../util/dbConn';

const Department = db.define('departments',{
  id: {
    type: DataTypes.INTEGER,
    autoIncrement: true,
    allowNull: false,
    primaryKey: true
  },
  dept_name: {
    type: DataTypes.STRING,
    allowNull: false,
  },
  dept_status: {
    type: DataTypes.BOOLEAN,
    allowNull: false,
    defaultValue: true,
  },
});

export default Department;