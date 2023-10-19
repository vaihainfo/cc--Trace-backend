import { DataTypes } from 'sequelize';
import db from '../util/dbConn';

const DyingFabricSelection = db.define('dying_fabric_selections', {
  id: {
    allowNull: false,
    autoIncrement: true,
    primaryKey: true,
    type: DataTypes.INTEGER
  },
  sales_id: {
    type: DataTypes.INTEGER
  },
  process_type: {
    type: DataTypes.STRING
  },
  process_id: {
    type: DataTypes.STRING
  },
  qty_used: {
    type: DataTypes.DOUBLE
  },
});

DyingFabricSelection.sync();

export default DyingFabricSelection;