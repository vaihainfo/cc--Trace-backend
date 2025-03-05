import { DataTypes } from 'sequelize';
import db from '../util/dbConn';
import Brand from './brand.model';
import Season from './season.model';

const FarmGroup = db.define('farm_groups', {
  id: {
    type: DataTypes.INTEGER,
    autoIncrement: true,
    allowNull: false,
    primaryKey: true
  },
  brand_id: {
    type: DataTypes.INTEGER,
    allowNull: false,
  },
  season_id: {
    type: DataTypes.INTEGER,
    allowNull: false,
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
  latitude: {
    type: DataTypes.STRING
  },
  longitude: {
    type: DataTypes.STRING
  },
});


FarmGroup.belongsTo(Brand, {
  foreignKey: "brand_id",
  as: "brand",
})

FarmGroup.belongsTo(Season, {
  foreignKey: "season_id",
  as: "season",
})

FarmGroup.associate = (models: any) => {
  FarmGroup.hasMany(models.ICS, {
    foreignKey: 'farmGroup_id',
    as: 'farmGroup',
  });

  FarmGroup.hasMany(models.Farmer, {
    foreignKey: 'farmGroup_id',
    as: 'farmGroup',
  });

  FarmGroup.hasMany(models.ScopeCert, {
    foreignKey: 'farmGroup_id',
    as: 'farmGroup',
  });

  FarmGroup.hasMany(models.OrganicIntegrity, {
    foreignKey: 'farmGroup_id',
    as: 'farmGroup',
  });
};

export default FarmGroup;