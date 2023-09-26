import { DataTypes } from 'sequelize';
import db from '../util/dbConn';

const Rating = db.define('ratings', {
  id: {
    allowNull: false,
    autoIncrement: true,
    primaryKey: true,
    type: DataTypes.INTEGER
  },
  user_id: {
    type: DataTypes.INTEGER
  },
  user_type: {
    type: DataTypes.STRING
  },
  rated_by: {
    type: DataTypes.INTEGER
  },
  rated_by_type: {
    type: DataTypes.STRING
  },
  rating: {
    type: DataTypes.DOUBLE
  },
  description: {
    type: DataTypes.STRING
  },
});

Rating.sync();

export default Rating;
