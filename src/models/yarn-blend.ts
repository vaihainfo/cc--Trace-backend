import { DataTypes } from 'sequelize';
import db from '../util/dbConn';

const YarnBlend = db.define('yarn-blends', {
  id: {
    allowNull: false,
    autoIncrement: true,
    primaryKey: true,
    unique: true,
    type: DataTypes.INTEGER
  },
  cotton_name: {
    allowNull: false,
    type: DataTypes.STRING
  },
  cotton_percentage: {
    allowNull: false,
    type: DataTypes.DOUBLE
  },
  cotton_blend: {
    allowNull: false,
    type: DataTypes.ARRAY(DataTypes.INTEGER)
  },
  cotton_blend_percentage: {
    allowNull: false,
    type: DataTypes.ARRAY(DataTypes.DOUBLE)
  },
  brand_id: {
    allowNull: false,
    type: DataTypes.ARRAY(DataTypes.INTEGER)
  },
  status: {
    allowNull: false,
    type: DataTypes.BOOLEAN
  },
});

export default YarnBlend;