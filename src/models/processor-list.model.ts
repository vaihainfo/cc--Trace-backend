import { DataTypes } from 'sequelize';
import db from '../util/dbConn';

const ProcessorList = db.define('processor_lists', {
  id: {
    type: DataTypes.INTEGER,
    autoIncrement: true,
    allowNull: false,
    primaryKey: true
  },
  name: {
    type: DataTypes.STRING,
  },
  address: {
    type: DataTypes.STRING,
  },
  status: {
    type: DataTypes.BOOLEAN
  },
});

ProcessorList.sync();

export default ProcessorList;