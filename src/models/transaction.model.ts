import { DataTypes } from 'sequelize';
import db from '../util/dbConn';

import Country from './country.model';
import State from './state.model';
import District from './district.model';
import Block from './block.model';
import Village from './village.model';
import Farmer from './farmer.model';
import CropGrade from './crop-grade.model';
import Program from './program.model';
import Brand from './brand.model';
import Season from './season.model';
import Ginner from './ginner.model';
import Farm from './farm.model';
import UserApp from './users-app.model';

const Transaction = db.define('transactions', {
  id: {
    type: DataTypes.INTEGER,
    autoIncrement: true,
    allowNull: false,
    primaryKey: true
  },
  date: {
    allowNull: false,
    type: DataTypes.DATE
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
  district_id: {
    type: DataTypes.INTEGER,
    foreignKey: true,
    references: { model: 'districts', key: 'id' },
    onDelete: 'CASCADE',
    allowNull: false,
  },
  block_id: {
    type: DataTypes.INTEGER,
    foreignKey: true,
    references: { model: 'blocks', key: 'id' },
    onDelete: 'CASCADE',
    allowNull: false,
  },
  village_id: {
    type: DataTypes.INTEGER,
    foreignKey: true,
    references: { model: 'villages', key: 'id' },
    onDelete: 'CASCADE',
  },
  farmer_id: {
    type: DataTypes.INTEGER,
    foreignKey: true,
    references: { model: 'farmers', key: 'id' },
    onDelete: 'CASCADE',
    allowNull: false,
  },
  farmer_name: {
    allowNull: false,
    type: DataTypes.STRING
  },
  brand_id: {
    type: DataTypes.INTEGER,
    // references: { model: 'brands', key: 'id' },
    // onDelete: 'SET NULL',
    allowNull: true,
  },
  farmer_code: {
    type: DataTypes.STRING
  },
  season_id: {
    type: DataTypes.INTEGER,
    foreignKey: true,
    references: { model: 'seasons', key: 'id' },
    onDelete: 'CASCADE',
    allowNull: false,
  },
  qty_purchased: {
    allowNull: false,
    type: DataTypes.STRING
  },
  rate: {
    allowNull: false,
    type: DataTypes.STRING
  },
  grade_id: {
    type: DataTypes.INTEGER,
    foreignKey: true,
    references: { model: 'crop_grades', key: 'id' },
    onDelete: 'CASCADE',
    allowNull: false,
  },
  program_id: {
    type: DataTypes.INTEGER,
    foreignKey: true,
    references: { model: 'programs', key: 'id' },
    onDelete: 'CASCADE',
    allowNull: false,
  },
  total_amount: {
    type: DataTypes.STRING
  },
  mapped_ginner: {
    allowNull: false,
    type: DataTypes.INTEGER
  },
  vehicle: {
    type: DataTypes.STRING
  },
  payment_method: {
    type: DataTypes.STRING
  },
  proof: {
    type: DataTypes.STRING
  },
  status: {
    allowNull: false,
    type: DataTypes.STRING
  },
  accept_date: {
    type: DataTypes.DATE
  },
  farm_id: {
    type: DataTypes.INTEGER
  },
  estimated_cotton: {
    type: DataTypes.DOUBLE
  },
  available_cotton: {
    type: DataTypes.DOUBLE
  },
  qty_stock: {
    type: DataTypes.DOUBLE
  },
  agent_id: {
    type: DataTypes.INTEGER
  }
});


Transaction.belongsTo(Country, {
  foreignKey: "country_id",
  as: "country",
});

Transaction.belongsTo(State, {
  foreignKey: "state_id",
  as: "state",
});

Transaction.belongsTo(District, {
  foreignKey: "district_id",
  as: "district",
});

Transaction.belongsTo(Block, {
  foreignKey: "block_id",
  as: "block",
});

Transaction.belongsTo(Village, {
  foreignKey: "village_id",
  as: "village",
});

Transaction.belongsTo(Farmer, {
  foreignKey: "farmer_id",
  as: "farmer",
});

Transaction.belongsTo(CropGrade, {
  foreignKey: "grade_id",
  as: "grade",
});

Transaction.belongsTo(Brand, {
  foreignKey: "brand_id",
  as: "brand",
});

Transaction.belongsTo(Program, {
  foreignKey: "program_id",
  as: "program",
});

Transaction.belongsTo(Season, {
  foreignKey: "season_id",
  as: "season",
});

Transaction.belongsTo(Ginner, {
  foreignKey: "mapped_ginner",
  as: "ginner",
});

Transaction.belongsTo(Farm, {
  foreignKey: "farm_id",
  as: "farm",
});

Transaction.belongsTo(UserApp, {
  foreignKey: "agent_id",
  as: "agent",
});


Transaction.sync();

export default Transaction;