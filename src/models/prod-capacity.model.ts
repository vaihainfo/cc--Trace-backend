import { DataTypes  } from 'sequelize';
import db  from '../util/dbConn';

const ProdCapacity = db.define('prod_capacities',{
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
  },
});

export default ProdCapacity;