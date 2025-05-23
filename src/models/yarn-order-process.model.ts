import { DataTypes } from 'sequelize';
import db from '../util/dbConn';

const YarnOrderProcess = db.define('yarn_order_processes', {
  id: {
    type: DataTypes.INTEGER,
    autoIncrement: true,
    allowNull: false,
    primaryKey: true
  },
  name: {
    type: DataTypes.STRING,
    allowNull: false,
  },
  address: {
    type: DataTypes.STRING,
    allowNull: false,
  },
  spinnerId: {
    type: DataTypes.INTEGER,
    allowNull: false,
    references: {
      model: 'spinners',
      key: 'id'
    }
  }
});

export default YarnOrderProcess;
