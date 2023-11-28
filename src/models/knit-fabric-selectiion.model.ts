import { DataTypes } from 'sequelize';
import db from '../util/dbConn';

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

KnitFabricSelection.sync();
export default KnitFabricSelection;