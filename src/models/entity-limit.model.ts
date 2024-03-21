import { DataTypes  } from 'sequelize';
import db  from '../util/dbConn';

import Brand from './brand.model'

const EntityLimit = db.define('entity_limits',{
  id: {
    type: DataTypes.INTEGER,
    autoIncrement: true,
    allowNull: false,
    primaryKey: true
  },
  brand_id: {
    type: DataTypes.INTEGER,
    foreignKey: true,
    references: { model: 'brands', key: 'id' },
    onDelete: 'CASCADE',
    allowNull: false,
  },
  limit: {
    allowNull: false,
    type: DataTypes.INTEGER
  },
  used: {
    type: DataTypes.INTEGER
  },
  remaining: {
    type: DataTypes.INTEGER
  },
});

EntityLimit.belongsTo(Brand, {
  foreignKey: "brand_id",
  as: "brand",
});

export default EntityLimit;