import { DataTypes  } from 'sequelize';
import db  from '../util/dbConn';
import State from './state.model'

const Country = db.define('countries',{
  id: {
    type: DataTypes.INTEGER,
    autoIncrement: true,
    allowNull: false,
    primaryKey: true
  },
  county_name: {
    type: DataTypes.STRING,
    allowNull: false,
  },
  country_status: {
    type: DataTypes.BOOLEAN,
    allowNull: false,
    defaultValue: true,
  },
});

Country.associate = (models: any) => {
  Country.hasMany(models.State, {
    foreignKey: 'country_id',
    as: 'country',
  });
  Country.hasMany(models.Farmer, {
    foreignKey: 'country_id',
    as: 'country',
  });
  Country.hasMany(models.Trader, {
    foreignKey: 'country_id',
    as: 'country',
  });
  Country.hasMany(models.Garment, {
    foreignKey: 'country_id',
    as: 'country',
  });
  Country.hasMany(models.Knitter, {
    foreignKey: 'country_id',
    as: 'country',
  });
  Country.hasMany(models.Weaver, {
    foreignKey: 'country_id',
    as: 'country',
  });
  Country.hasMany(models.Spinner, {
    foreignKey: 'country_id',
    as: 'country',
  });
  Country.hasMany(models.Ginner, {
    foreignKey: 'country_id',
    as: 'country',
  });
  Country.hasMany(models.Transaction, {
    foreignKey: 'country_id',
    as: 'country',
  });

  Country.hasMany(models.Fabric, {
    foreignKey: 'country_id',
    as: 'country',
  });

  Country.hasMany(models.ScopeCert, {
    foreignKey: 'country_id',
    as: 'country',
  });

  Country.hasMany(models.ProcessorTraining, {
    foreignKey: 'country_id',
    as: 'country',
  });
};

Country.sync();

export default Country;