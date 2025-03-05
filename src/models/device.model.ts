import { DataTypes  } from 'sequelize';
import db  from '../util/dbConn';
import User from './user.model'

const Device = db.define('devices',{
  id: {
    type: DataTypes.INTEGER,
    autoIncrement: true,
    allowNull: false,
    primaryKey: true
  },
  device_id: {
    allowNull: false,
    type: DataTypes.STRING
  },
  staff_name: {
    allowNull: false,
    type: DataTypes.STRING
  },
  user_id: {
    type: DataTypes.INTEGER,
    foreignKey: true,
    references: { model: 'users', key: 'id' },
    onDelete: 'CASCADE',
    allowNull: false,
  },
  entry_date: {
    type: DataTypes.DATE
  },
  status: {
    type: DataTypes.BOOLEAN
  },
});

Device.belongsTo(User, {
  foreignKey: "user_id",
  as: "user",
})

Device.sync();

export default Device;