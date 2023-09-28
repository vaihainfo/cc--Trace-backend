import { DataTypes } from 'sequelize';
import db from '../util/dbConn';

const CottonSelection = db.define('cotton_selections', {
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
  transaction_id: {
    allowNull: false,
    type: DataTypes.INTEGER
  },
  qty_used: {
    allowNull: false,
    type: DataTypes.DOUBLE
  }
});

CottonSelection.sync();

export default CottonSelection;