import { DataTypes } from 'sequelize';
import db from '../util/dbConn';

import Ginner from './ginner.model';
import Season from './season.model';
import Program from './program.model';
import Country from './country.model';
import Brand from './brand.model';
import State from './state.model';
import District from './district.model';
import Village from './village.model';
import Block from './block.model';

const GinnerAllocatedVillage = db.define('ginner_allocated_villages', {
  id: {
    type: DataTypes.INTEGER,
    autoIncrement: true,
    allowNull: false,
    primaryKey: true
  },
  ginner_id: {
    type: DataTypes.INTEGER,
    allowNull: false,
  },
  season_id: {
    type: DataTypes.INTEGER
  },
  program_id: {
    allowNull: false,
    type: DataTypes.INTEGER
  },
  brand_id: {
    allowNull: false,
    type: DataTypes.INTEGER
  },
  country_id: {
    allowNull: false,
    type: DataTypes.INTEGER
  },
  state_id: {
    allowNull: false,
    type: DataTypes.INTEGER
  },
  district_id: {
    allowNull: false,
    type: DataTypes.INTEGER
  },
  block_id: {
    allowNull: false,
    type: DataTypes.INTEGER
  },
  village_id: {
    allowNull: false,
    type: DataTypes.INTEGER
  },
});

GinnerAllocatedVillage.belongsTo(Season, {
  foreignKey: "season_id",
  as: "season",
});

GinnerAllocatedVillage.belongsTo(Program, {
  foreignKey: "program_id",
  as: "program",
});

GinnerAllocatedVillage.belongsTo(Country, {
  foreignKey: "country_id",
  as: "country",
});

GinnerAllocatedVillage.belongsTo(State, {
  foreignKey: "state_id",
  as: "state",
});

GinnerAllocatedVillage.belongsTo(District, {
  foreignKey: "district_id",
  as: "district",
});

GinnerAllocatedVillage.belongsTo(Village, {
  foreignKey: "village_id",
  as: "village",
});

GinnerAllocatedVillage.belongsTo(Block, {
  foreignKey: "block_id",
  as: "block",
});

GinnerAllocatedVillage.belongsTo(Brand, {
  foreignKey: "brand_id",
  as: "brand",
});

GinnerAllocatedVillage.belongsTo(Ginner, {
  foreignKey: "ginner_id",
  as: "ginner",
});

GinnerAllocatedVillage.sync();

export default GinnerAllocatedVillage;