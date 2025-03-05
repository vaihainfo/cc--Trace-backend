import { DataTypes  } from 'sequelize';
import db  from '../util/dbConn';
import State from './state.model';
import Block from './block.model';

const District = db.define('districts',{
  id: {
    type: DataTypes.INTEGER,
    autoIncrement: true,
    allowNull: false,
    primaryKey: true
  },
  district_name: {
    type: DataTypes.STRING,
    allowNull: false,
  },
  district_status: {
    type: DataTypes.BOOLEAN,
    allowNull: false,
    defaultValue: true,
  },
});

District.belongsTo(State, {
  foreignKey: "state_id",
  as: "state",
})

// District.hasMany(Block, {
//   foreignKey: "district_id",
//   as: "district",
// });

// District.hasMany(Block, {
//   foreignKey: "district_id",
//   as: "district",
// })

District.associate = (models: any) => {
  District.hasMany(models.Block, {
    foreignKey: "district_id",
    as: "district",
  });
  District.hasMany(models.Farmer, {
    foreignKey: "district_id",
    as: "district",
  });

  District.hasMany(models.Transaction, {
    foreignKey: "district_id",
    as: "district",
  });
};

export default District;