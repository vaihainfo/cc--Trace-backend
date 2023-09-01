import { DataTypes  } from 'sequelize';
import db  from '../util/dbConn';

const Video = db.define('videos',{
  id: {
    type: DataTypes.INTEGER,
    autoIncrement: true,
    allowNull: false,
    primaryKey: true
  },
  country: {
    type: DataTypes.ARRAY(DataTypes.INTEGER),
    allowNull: false,
  },
  brand: {
    type: DataTypes.ARRAY(DataTypes.INTEGER),
    allowNull: false,
  },
  processor: {
    type: DataTypes.STRING,
    allowNull: false,
  },
  title: {
    type: DataTypes.STRING,
    allowNull: false,
  },
  description: {
    type: DataTypes.STRING,
    allowNull: false,
  },
  video: {
    type: DataTypes.STRING,
    allowNull: false,
  },
  status: {
    type: DataTypes.BOOLEAN,
    allowNull: false,
    defaultValue: true,
  },
});

export default Video;