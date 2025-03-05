import { DataTypes } from 'sequelize';
import db from '../util/dbConn';
import FabricType from './fabric-type.model';
import WeaverProcess from './weaver-process.model';

const WeaverFabric = db.define('weaver_fabrics', {
  id: {
    type: DataTypes.INTEGER,
    autoIncrement: true,
    allowNull: false,
    primaryKey: true
  },
  process_id: {
    type: DataTypes.INTEGER
  },
  fabric_type: {
    type: DataTypes.INTEGER
  },
  fabric_gsm: {
    type: DataTypes.STRING
  },
  fabric_length: {
    type: DataTypes.DOUBLE
  },
  fabric_length_stock: {
    type: DataTypes.DOUBLE
  },
  sold_status: {
    type: DataTypes.BOOLEAN
  }
});

WeaverFabric.belongsTo(WeaverProcess, {
  foreignKey: "process_id",
  as: "process",
});

WeaverFabric.belongsTo(FabricType, {
  foreignKey: "fabric_type",
  as: "fabric",
});

WeaverFabric.sync();
export default WeaverFabric;