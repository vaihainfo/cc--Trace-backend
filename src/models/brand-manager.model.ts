import { DataTypes } from 'sequelize';
import db from '../util/dbConn';

import Country from './country.model';

const BrandManager = db.define('brand_managers', {
  id: {
    type: DataTypes.INTEGER,
    autoIncrement: true,
    allowNull: false,
    primaryKey: true
  },
  name: {
    allowNull: false,
    type: DataTypes.TEXT
  },
  country_id: {
    type: DataTypes.INTEGER,
    foreignKey: true,
    references: { model: 'countries', key: 'id' },
    onDelete: 'CASCADE',
    allowNull: false,
  },
  program_id: {
    allowNull: false,
    type: DataTypes.ARRAY(DataTypes.INTEGER)
  },
  brand: {
    allowNull: false,
    type: DataTypes.ARRAY(DataTypes.INTEGER)
  },
  mapped_states: {
    type: DataTypes.ARRAY(DataTypes.INTEGER)
  },
  mapped_spinners: {
    type: DataTypes.ARRAY(DataTypes.INTEGER)
  },
  mobile: {
    type: DataTypes.STRING
  },
  email: {
    type: DataTypes.STRING
  },
  bmUser_id: {
    allowNull: false,
    type: DataTypes.ARRAY(DataTypes.INTEGER)
  },
  status: {
    allowNull: false,
    defaultValue: true,
    type: DataTypes.BOOLEAN
  },
});

BrandManager.belongsTo(Country, {
  foreignKey: "country_id",
  as: "country",
});


BrandManager.sync();

export default BrandManager;
