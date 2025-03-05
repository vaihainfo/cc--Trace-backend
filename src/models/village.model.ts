import { DataTypes  } from 'sequelize';
import db  from '../util/dbConn';
import Block from './block.model';

const Village = db.define('villages',{
  id: {
    type: DataTypes.INTEGER,
    autoIncrement: true,
    allowNull: false,
    primaryKey: true
  },
  village_name: {
    type: DataTypes.STRING,
    allowNull: false,
  },
  village_status: {
    type: DataTypes.BOOLEAN,
    allowNull: false,
    defaultValue: true,
  },
  village_latitude: {
    type: DataTypes.STRING,
    allowNull: false,
  },
  village_longitude: {
    type: DataTypes.STRING,
    allowNull: false,
  },
});

Village.belongsTo(Block, {
  foreignKey: "block_id",
  as: "block",
})

Village.associate = (models: any) => {
  Village.hasMany(models.Farmer, {
    foreignKey: "village_id",
    as: "village",
  });

  Village.hasMany(models.Transaction, {
    foreignKey: "village_id",
    as: "village",
  });
};

export default Village;