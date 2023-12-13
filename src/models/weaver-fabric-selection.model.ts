import { DataTypes } from 'sequelize';
import db from '../util/dbConn';
import WeaverProcess from './weaver-process.model';

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

WeaverFabricSelection.belongsTo(WeaverProcess, {
  foreignKey: "fabric_id",
  as: "process",
});

WeaverFabricSelection.sync();
export default WeaverFabricSelection;