import { DataTypes } from 'sequelize';
import db from '../util/dbConn';
import KnitProcess from './knit-process.model';
import KnitSales from './knit-sales.model';

const KnitFabricSelection = db.define('knit_fabric_selections', {
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

KnitFabricSelection.belongsTo(KnitProcess, {
  foreignKey: "fabric_id",
  as: "process",
});

KnitFabricSelection.belongsTo(KnitSales, {
  foreignKey: "sales_id",
  as: "sales",
});

KnitFabricSelection.sync();
export default KnitFabricSelection;