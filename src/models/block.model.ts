import { DataTypes } from 'sequelize';
import db from '../util/dbConn';
import District from './district.model';
import Village from './village.model';

const Block = db.define('blocks', {
  id: {
    type: DataTypes.INTEGER,
    autoIncrement: true,
    allowNull: false,
    primaryKey: true
  },
  block_name: {
    type: DataTypes.STRING,
    allowNull: false,
  },
  block_status: {
    type: DataTypes.BOOLEAN,
    allowNull: false,
  }
});

Block.belongsTo(District, {
  foreignKey: "district_id",
  as: "district",
})
Block.associate = (models: any) => {
  Block.hasMany(models.Village, {
    foreignKey: "block_id",
    as: "block",
  });
  Block.hasMany(models.Farmer, {
    foreignKey: "block_id",
    as: "block",
  });

  Block.hasMany(models.Transaction, {
    foreignKey: "block_id",
    as: "block",
  });
};

// Block.hasMany(Village, {
//   foreignKey: "block_id",
//   as: "block",
// })

Block.sync();

export default Block;