import { DataTypes } from 'sequelize';
import db from '../util/dbConn';

const UserRegistrations = db.define('user_registrations', {
  id: {
    allowNull: false,
    autoIncrement: true,
    primaryKey: true,
    type: DataTypes.INTEGER
  },
  firstName: {
    type: DataTypes.STRING
  },
  lastName: {
    type: DataTypes.STRING
  },
  mobile_no: {
    type: DataTypes.STRING
  },
  device_id: {
    type: DataTypes.STRING
  },
  status: {
    type: DataTypes.BOOLEAN
  },
});

UserRegistrations.sync();

export default UserRegistrations;