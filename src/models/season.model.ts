import { DataTypes  } from 'sequelize';
import db  from '../util/dbConn';

const Season = db.define('seasons',{
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
  from: {
    type: DataTypes.STRING,
    allowNull: false,
  },
  to: {
    type: DataTypes.STRING,
    allowNull: false,
  },
});

Season.associate = (models: any) => {
  Season.hasMany(models.Transaction, {
    foreignKey: 'season_id',
    as: 'season',
  });
};

Season.sync();

export default Season;