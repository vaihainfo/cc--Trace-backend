import { DataTypes } from 'sequelize';
import db from '../util/dbConn';
import SpinProcess from './spin-process.model';
import SpinSales from './spin-sales.model';
import SpinYarn from './spin-yarn.model';

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
  yarn_id:{
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

SpinProcessYarnSelection.belongsTo(SpinProcess, {
  foreignKey: "spin_process_id",
  as: "process",
});

SpinProcessYarnSelection.belongsTo(SpinYarn, {
  foreignKey: "yarn_id",
  as: "spinyarn",
});

SpinProcessYarnSelection.belongsTo(SpinSales, {
  foreignKey: "sales_id",
  as: "sales",
});


SpinProcessYarnSelection.sync();

export default SpinProcessYarnSelection;
