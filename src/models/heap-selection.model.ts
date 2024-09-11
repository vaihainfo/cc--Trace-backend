import { DataTypes } from 'sequelize';
import db from '../util/dbConn';
import GinProcess from './gin-process.model';
import GinHeap from './gin-heap.model';

const CottonSelection = db.define('heap_selections', {
  id: {
    allowNull: false,
    autoIncrement: true,
    primaryKey: true,
    type: DataTypes.INTEGER
  },
  process_id: {
    type: DataTypes.INTEGER,
    allowNull: false,
  },
  heap_id: {
    type: DataTypes.INTEGER,
    defaultValue: null
  },
  transaction_id: {
    allowNull: false,
    type: DataTypes.ARRAY(DataTypes.INTEGER)
  },
  village_id: {
    allowNull: false,
    type: DataTypes.ARRAY(DataTypes.INTEGER)
  },
  qty_used: {
    allowNull: false,
    type: DataTypes.DOUBLE
  },
  status: {
    type: DataTypes.BOOLEAN,
  },
});

CottonSelection.belongsTo(GinProcess, {
  foreignKey: "process_id",
  as: "ginprocess",
});

CottonSelection.belongsTo(GinHeap, {
  foreignKey: "heap_id",
  as: "ginheap",
});

CottonSelection.sync();

export default CottonSelection;