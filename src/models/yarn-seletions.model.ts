import { DataTypes } from 'sequelize';
import db from '../util/dbConn';

const YarnSelection = db.define('yarn_selections', {
  id: {
    type: DataTypes.INTEGER,
    autoIncrement: true,
    allowNull: false,
    primaryKey: true
  },
  yarn_id: {
    type: DataTypes.INTEGER
  },
  sales_id: {
    type: DataTypes.INTEGER
  },
  type: {
    type: DataTypes.STRING
  },
  qty_used: {
    type: DataTypes.DOUBLE
  },
});

YarnSelection.sync();

export default YarnSelection;
