import { DataTypes } from 'sequelize';
import db from '../util/dbConn';
import SpinProcess from './spin-process.model';
import GinSales from './gin-sales.model';

const LintSelections = db.define('lint_selections', {
  id: {
    type: DataTypes.INTEGER,
    autoIncrement: true,
    allowNull: false,
    primaryKey: true
  },
  process_id: {
    type: DataTypes.INTEGER
  },
  lint_id: {
    type: DataTypes.INTEGER
  },
  qty_used: {
    type: DataTypes.DOUBLE
  }
});

LintSelections.belongsTo(SpinProcess, {
  foreignKey: "process_id",
  as: "spinprocess",
});

LintSelections.belongsTo(GinSales, {
  foreignKey: "lint_id",
  as: "ginsales",
});

LintSelections.sync();

export default LintSelections;

