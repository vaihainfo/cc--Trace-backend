import { DataTypes  } from 'sequelize';
import db  from '../util/dbConn';

import Ginner from './ginner.model';

const GinProcess = db.define('gin_process',{
  id: {
    type: DataTypes.INTEGER,
    autoIncrement: true,
    allowNull: false,
    primaryKey: true
  },
  ginner_id: {
    type: DataTypes.INTEGER,
    foreignKey: true,
    references: { model: 'ginners', key: 'id' },
    onDelete: 'CASCADE',
    allowNull: false,
  },
  season_id: {
    allowNull: false,
    type: DataTypes.INTEGER
  },
  date: {
    allowNull: false,
    type: DataTypes.DATE
  },
  program_id: {
    allowNull: false,
    type: DataTypes.INTEGER
  },
  total_qty: {
    type: DataTypes.DOUBLE
  },
  no_of_bales: {
    type: DataTypes.INTEGER
  },
  gin_out_turn: {
    type: DataTypes.DOUBLE
  },
  lot_no: {
    allowNull: false,
    type: DataTypes.STRING
  },
  reel_lot_no: {
    type: DataTypes.STRING
  },
  press_no: {
    type: DataTypes.STRING
  },
  weight: {
    type: DataTypes.STRING
  },
  staple: {
    type: DataTypes.STRING
  },
  mic: {
    type: DataTypes.STRING
  },
  strength: {
    type: DataTypes.STRING
  },
  trash: {
    type: DataTypes.STRING
  },
  color_grade: {
    type: DataTypes.STRING
  },
});

GinProcess.belongsTo(Ginner, {
  foreignKey: "ginner_id",
  as: "ginner",
});

GinProcess.sync();

export default GinProcess;