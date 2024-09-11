import { DataTypes } from 'sequelize';
import db from '../util/dbConn';

import Ginner from './ginner.model';
import Season from './season.model';
import Program from './program.model';

const GinHeap = db.define('gin_heaps', {
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
  program_id: {
    allowNull: false,
    type: DataTypes.INTEGER
  },
  heap_starting_date: {
    allowNull: false,
    type: DataTypes.DATE
  },
  from_date: {
    allowNull: false,
    type: DataTypes.DATE
  },
  to_date: {
    allowNull: false,
    type: DataTypes.DATE
  },
  heap_ending_date: {
    allowNull: false,
    type: DataTypes.DATE
  },
  ginner_heap_no: {
    allowNull: false,
    type: DataTypes.STRING
  },
  reel_heap_no: {
    allowNull: false,
    type: DataTypes.STRING
  },
  upload_heap_register: {
    type: DataTypes.STRING
  },
   weighbridge_village: {
    type: DataTypes.STRING
  },
   weighbridge_vehicle_no: {
    type: DataTypes.STRING
  },
   weighbridge_upload_recipt: {
    type: DataTypes.STRING
  },
   weighbridge_vehicle_photo: {
    type: DataTypes.STRING
  },
  estimated_heap: {
    type: DataTypes.DOUBLE
  },
  qty_stock: {
    type: DataTypes.DOUBLE
  },
  status: {
    allowNull: false,
    type: DataTypes.BOOLEAN,
    defaultValue: false
  },
});

GinHeap.belongsTo(Season, {
  foreignKey: "season_id",
  as: "season",
});

GinHeap.belongsTo(Program, {
  foreignKey: "program_id",
  as: "program",
});


GinHeap.belongsTo(Ginner, {
  foreignKey: "ginner_id",
  as: "ginner",
});

GinHeap.sync();

export default GinHeap;