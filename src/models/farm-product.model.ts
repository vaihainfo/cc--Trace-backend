import { DataTypes  } from 'sequelize';
import db  from '../util/dbConn';
import FarmItem from './farm-item.model'

const FarmProduct = db.define('farm_products',{
  id: {
    type: DataTypes.INTEGER,
    autoIncrement: true,
    allowNull: false,
    primaryKey: true
  },
  farmProduct: {
    type: DataTypes.STRING,
    allowNull: false,
  },
  farmProduct_status: {
    type: DataTypes.BOOLEAN,
    allowNull: false,
    defaultValue: true,
  },
});

FarmProduct.belongsTo(FarmItem, {
  foreignKey: "farmItem_id",
  as: "farmItem",
})

export default FarmProduct;