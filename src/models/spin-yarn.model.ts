import { DataTypes } from 'sequelize';
import db from '../util/dbConn';

import SpinProcess from './spin-process.model';
import YarnCount from './yarn-count.model';

const SpinYarn = db.define('spin_yarns', {
  id: {
    type: DataTypes.INTEGER,
    autoIncrement: true,
    allowNull: false,
    primaryKey: true
  },
  process_id: {
    type: DataTypes.INTEGER,
    allowNull: false,
  },
  yarn_count: {
    type: DataTypes.INTEGER
  },
  yarn_produced: {
    type: DataTypes.DOUBLE
  },
  qr: {
    type: DataTypes.STRING
  },
  sold_status: {
    type: DataTypes.BOOLEAN,
    defaultValue: false
  }
});

SpinYarn.belongsTo(SpinProcess, {
  foreignKey: "process_id",
  as: "spinprocess",
});

SpinYarn.belongsTo(YarnCount, {
  foreignKey: "yarn_count",
  as: "yarncount",
});

SpinYarn.sync();

export default SpinYarn;