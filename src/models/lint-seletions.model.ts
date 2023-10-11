import { DataTypes } from 'sequelize';
import db from '../util/dbConn';

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

LintSelections.sync();

export default LintSelections;

