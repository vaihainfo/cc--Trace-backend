import { DataTypes } from 'sequelize';
import db from '../util/dbConn';

const WeaverFabricSelection = db.define('weaver_fabric_selections', {
  id: {
    type: DataTypes.INTEGER,
    autoIncrement: true,
    allowNull: false,
    primaryKey: true
  },
  fabric_id: {
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

WeaverFabricSelection.sync();
export default WeaverFabricSelection;