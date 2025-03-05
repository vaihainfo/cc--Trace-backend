import { DataTypes  } from 'sequelize';
import db  from '../util/dbConn';

const GarmentType = db.define('garment_types',{
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
  status: {
    type: DataTypes.BOOLEAN,
    allowNull: false,
    defaultValue: true,
  }
});

GarmentType.sync();

export default GarmentType;