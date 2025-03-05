import { DataTypes } from 'sequelize';
import db from '../util/dbConn';

const ComberSelection = db.define('comber_selections', {
  id: {
    allowNull: false,
    autoIncrement: true,
    primaryKey: true,
    type: DataTypes.INTEGER
  },
  process_id: {
    type: DataTypes.INTEGER
  },
  yarn_id: {
    type: DataTypes.INTEGER
  },
  qty_used: {
    type: DataTypes.DOUBLE
  }
});

ComberSelection.sync();

export default ComberSelection;