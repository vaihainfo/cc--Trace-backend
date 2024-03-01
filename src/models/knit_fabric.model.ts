import { DataTypes } from 'sequelize';
import db from '../util/dbConn';
import KnitProcess from './knit-process.model';
import FabricType from './fabric-type.model';

const KnitFabric = db.define('knit_fabrics', {
  id: {
    type: DataTypes.INTEGER,
    autoIncrement: true,
    allowNull: false,
    primaryKey: true
  },
  process_id : {
    type: DataTypes.INTEGER
  },
  fabric_type: {
    type: DataTypes.INTEGER
  },
  fabric_gsm: {
    type: DataTypes.STRING
  },
  fabric_weight : {
    type: DataTypes.DOUBLE
  },
  sold_status :{
    type : DataTypes.BOOLEAN
  }
});

KnitFabric.belongsTo(KnitProcess, {
  foreignKey: "process_id",
  as: "process",
});

KnitFabric.belongsTo(FabricType, {
  foreignKey: "fabric_type",
  as: "fabric",
});

KnitFabric.sync();
export default KnitFabric;