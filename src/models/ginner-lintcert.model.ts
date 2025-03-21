import { DataTypes } from 'sequelize';
import db from '../util/dbConn';

import Country from './country.model';
import State from './state.model';
import Ginner from './ginner.model';
import Season from './season.model';
import Program from './program.model';
import Brand from './brand.model';

const GinnerLintCertificate = db.define('ginner_lint_certificates', {
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
  program_id: {
    allowNull: false,
    type: DataTypes.INTEGER
  },
  ginner_id: {
    type: DataTypes.INTEGER,
    foreignKey: true,
    references: { model: 'ginners', key: 'id' },
    onDelete: 'CASCADE',
    allowNull: false,
  },
  season_id: {
    type: DataTypes.INTEGER,
    foreignKey: true,
    references: { model: 'seasons', key: 'id' },
    onDelete: 'CASCADE',
    allowNull: false,
  },
  document: {
    type: DataTypes.ARRAY(DataTypes.TEXT), 
    allowNull: false,
  },
  brand_id:{
    type: DataTypes.INTEGER,
    foreignKey: true,
    references: { model: 'brands', key: 'id' },
    onDelete: 'CASCADE',
    allowNull: false,
  }
});

GinnerLintCertificate.belongsTo(Country, {
  foreignKey: "country_id",
  as: "country",
});

GinnerLintCertificate.belongsTo(State, {
  foreignKey: "state_id",
  as: "state",
});

GinnerLintCertificate.belongsTo(Brand, {
  foreignKey: "brand_id",
  as: "brand",
});

GinnerLintCertificate.belongsTo(Season, {
  foreignKey: "season_id",
  as: "season",
});

GinnerLintCertificate.belongsTo(Program, {
  foreignKey: "program_id",
  as: "program",
});

GinnerLintCertificate.belongsTo(Ginner, {
  foreignKey: "ginner_id",
  as: "ginner",
});

export default GinnerLintCertificate;
