import { DataTypes } from 'sequelize';
import db from '../util/dbConn';

const SpinProcessYarnSelection = db.define('spin_process_yarn_selections', {
  id: {
    type: DataTypes.INTEGER,
    autoIncrement: true,
    allowNull: false,
    primaryKey: true
  },
  spin_process_id: {
    type: DataTypes.INTEGER
  },
  sales_id: {
    type: DataTypes.INTEGER
  },
  no_of_box: {
    type: DataTypes.DOUBLE
  },
  qty_used: {
    type: DataTypes.DOUBLE
  },
});

SpinProcessYarnSelection.sync();

export default SpinProcessYarnSelection;
