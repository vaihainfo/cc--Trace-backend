import { DataTypes } from 'sequelize';
import db from '../util/dbConn';
import WeaverProcess from './weaver-process.model';
import WeaverSales from './weaver-sales.model';
import WeaverFabric from './weaver_fabric.model';

const WeaverFabricSelection = db.define('weaver_fabric_selections', {
  id: {
    type: DataTypes.INTEGER,
    autoIncrement: true,
    allowNull: false,
    primaryKey: true
  },
  weaver_fabric :{
    type: DataTypes.INTEGER
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


WeaverFabricSelection.belongsTo(WeaverFabric, {
  foreignKey: "weaver_fabric",
  as: "weaverfabric",
});

WeaverFabricSelection.belongsTo(WeaverSales, {
  foreignKey: "sales_id",
  as: "sales",
});

WeaverFabricSelection.sync();
export default WeaverFabricSelection;