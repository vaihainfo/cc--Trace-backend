import { DataTypes } from 'sequelize';
import db from '../util/dbConn';
import GinProcess from './gin-process.model';
import Ginner from './ginner.model';
import Spinner from './spinner.model';
import SpinProcess from './spin-process.model';
import GinSales from './gin-sales.model';

const QualityParameter = db.define('quality-parameters', {
  id: {
    allowNull: false,
    autoIncrement: true,
    primaryKey: true,
    type: DataTypes.INTEGER
  },
  process_id: {
    type: DataTypes.INTEGER
  },
  spinner_id: {
    type: DataTypes.INTEGER
  },
  ginner_id: {
    type: DataTypes.INTEGER
  },
  sold_to: {
    type: DataTypes.INTEGER
  },
  test_report: {
    type: DataTypes.DATE
  },
  lab_name: {
    type: DataTypes.STRING
  },
  sci: {
    type: DataTypes.DOUBLE
  },
  moisture: {
    type: DataTypes.DOUBLE
  },
  mic: {
    type: DataTypes.DOUBLE
  },
  mat: {
    type: DataTypes.DOUBLE
  },
  uhml: {
    type: DataTypes.DOUBLE
  },
  ui: {
    type: DataTypes.DOUBLE
  },
  sf: {
    type: DataTypes.DOUBLE
  },
  str: {
    type: DataTypes.DOUBLE
  },
  elg: {
    type: DataTypes.DOUBLE
  },
  rd: {
    type: DataTypes.DOUBLE
  },
  plusb: {
    type: DataTypes.DOUBLE
  },
  sales_id: {
    type: DataTypes.INTEGER
  },
  lot_no: {
    type: DataTypes.STRING
  },
  reel_lot_no: {
    type: DataTypes.STRING
  },
  document: {
    type: DataTypes.ARRAY(DataTypes.STRING)
  },
});

QualityParameter.belongsTo(Spinner, {
  foreignKey: "sold_to",
  as: "sold",
});

QualityParameter.belongsTo(GinProcess, {
  foreignKey: "process_id",
  as: "process",
});

QualityParameter.belongsTo(Ginner, {
  foreignKey: "ginner_id",
  as: "ginner",
});

QualityParameter.belongsTo(Spinner, {
  foreignKey: "spinner_id",
  as: "spinner",
});

QualityParameter.belongsTo(GinSales, {
  foreignKey: "sales_id",
  as: "sales",
});

QualityParameter.sync();

export default QualityParameter;
