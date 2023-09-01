import { DataTypes  } from 'sequelize';
import db  from '../util/dbConn';

const FabricType = db.define('fabric_types',{
  id: {
    type: DataTypes.INTEGER,
    autoIncrement: true,
    allowNull: false,
    primaryKey: true
  },
  fabricType_name: {
    type: DataTypes.STRING,
    allowNull: false,
  },
  fabricType_status: {
    type: DataTypes.BOOLEAN,
    allowNull: false,
    defaultValue: true,
  },
});

export default FabricType;