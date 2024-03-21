import { DataTypes } from 'sequelize';
import db from '../util/dbConn';

import Country from './country.model';
import State from './state.model';
import Brand from './brand.model';
import FarmGroup from './farm-group.model';
import ICS from './ics.model'

const ScopeCert = db.define('scope_certs', {
  id: {
    type: DataTypes.INTEGER,
    autoIncrement: true,
    allowNull: false,
    primaryKey: true
  },

  country_id: {
    type: DataTypes.INTEGER,
    foreignKey: true,
    references: { model: 'countries', key: 'id' },
    onDelete: 'CASCADE',
    allowNull: false,
  },
  state_id: {
    type: DataTypes.INTEGER,
    foreignKey: true,
    references: { model: 'states', key: 'id' },
    onDelete: 'CASCADE',
    allowNull: false,
  },
  brand_id: {
    type: DataTypes.INTEGER,
    foreignKey: true,
    references: { model: 'brands', key: 'id' },
    onDelete: 'CASCADE',
    allowNull: false,
  },
  farmGroup_id: {
    type: DataTypes.INTEGER,
    foreignKey: true,
    references: { model: 'farm_groups', key: 'id' },
    onDelete: 'CASCADE',
    allowNull: false,
  },
  ics_id: {
    type: DataTypes.INTEGER,
    foreignKey: true,
    references: { model: 'ics', key: 'id' },
    onDelete: 'CASCADE',
    allowNull: false,
  },
  validity_end: {
    allowNull: false,
    type: DataTypes.DATE
  },
  standard: {
    type: DataTypes.STRING
  },
  document: {
    allowNull: false,
    type: DataTypes.STRING
  },
});

ScopeCert.belongsTo(Country, {
  foreignKey: "country_id",
  as: "country",
});

ScopeCert.belongsTo(State, {
  foreignKey: "state_id",
  as: "state",
});
ScopeCert.belongsTo(Brand, {
  foreignKey: "brand_id",
  as: "brand",
});

ScopeCert.belongsTo(FarmGroup, {
  foreignKey: "farmGroup_id",
  as: "farmGroup",
});

ScopeCert.belongsTo(ICS, {
  foreignKey: "ics_id",
  as: "ics",
});

ScopeCert.sync();

export default ScopeCert;