import { DataTypes  } from 'sequelize';
import db  from '../util/dbConn';

const FarmItem = db.define('farm_items',{
  id: {
    type: DataTypes.INTEGER,
    autoIncrement: true,
    allowNull: false,
    primaryKey: true
  },
  farmItem: {
    type: DataTypes.STRING,
    allowNull: false,
  },
  farmItem_status: {
    type: DataTypes.BOOLEAN,
    allowNull: false,
    defaultValue: true,
  },
});

FarmItem.associate = (models: any) => {
  FarmItem.hasMany(models.FarmProduct, {
    foreignKey: 'farmItem_id',
    as: 'farmItem',
  });
};


export default FarmItem;