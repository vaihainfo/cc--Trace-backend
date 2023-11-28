import { DataTypes } from 'sequelize';
import db from '../util/dbConn';

import Weaver from './weaver.model';
import Dyeing from './dyeing.model';
import Program from './program.model';
import Season from './season.model';
import YarnCount from './yarn-count.model';
import FabricType from './fabric-type.model';
import Garment from './garment.model';
import Fabric from './fabric.model';

const WeaverProcess = db.define('weaver_processes', {
  id: {
    type: DataTypes.INTEGER,
    autoIncrement: true,
    allowNull: false,
    primaryKey: true
  },
  weaver_id: {
    type: DataTypes.INTEGER,
    foreignKey: true,
    references: { model: 'weavers', key: 'id' },
    onDelete: 'CASCADE',
    allowNull: false,
  },
  season_id: {
    allowNull: false,
    type: DataTypes.INTEGER
  },
  date: {
    allowNull: false,
    type: DataTypes.DATE
  },
  program_id: {
    allowNull: false,
    type: DataTypes.INTEGER
  },
  garment_order_ref: {
    type: DataTypes.STRING
  },
  brand_order_ref: {
    type: DataTypes.STRING
  },
  other_mix: {
    type: DataTypes.BOOLEAN
  },
  cottonmix_type: {
    type: DataTypes.ARRAY(DataTypes.INTEGER)
  },
  cottonmix_qty: {
    type: DataTypes.ARRAY(DataTypes.DOUBLE)
  },
  yarn_type: {
    type: DataTypes.STRING
  },
  yarn_count: {
    type: DataTypes.DOUBLE
  },
  blend_material: {
    type: DataTypes.STRING
  },
  blend_vendor: {
    type: DataTypes.STRING
  },
  yarn_qty: {
    type: DataTypes.DOUBLE
  },
  additional_yarn_qty: {
    type: DataTypes.DOUBLE
  },
  total_yarn_qty: {
    allowNull: false,
    type: DataTypes.DOUBLE
  },
  fabric_type: {
    type: DataTypes.ARRAY(DataTypes.INTEGER)
  },
  fabric_gsm: {
    type: DataTypes.ARRAY(DataTypes.STRING)
  },
  fabric_length: {
    type: DataTypes.ARRAY(DataTypes.DOUBLE)
  },
  batch_lot_no: {
    allowNull: false,
    type: DataTypes.STRING
  },
  reel_lot_no: {
    type: DataTypes.STRING
  },
  job_details_garment: {
    type: DataTypes.STRING
  },
  no_of_rolls: {
    type: DataTypes.INTEGER
  },
  dyeing_required: {
    allowNull: false,
    type: DataTypes.BOOLEAN
  },
  dyeing_id: {
    type: DataTypes.INTEGER,
    references: { model: 'dyeings', key: 'id' },
  },
  blend_invoice: {
    type: DataTypes.STRING
  },
  blend_document: {
    type: DataTypes.ARRAY(DataTypes.STRING)
  },
  qty_stock: {
    type: DataTypes.DOUBLE
  },
  physical_traceablity: {
    type: DataTypes.BOOLEAN
  },
  qr: {
    type: DataTypes.STRING
  },
  total_fabric_length: {
    type: DataTypes.DOUBLE
  },
  status: {
    type: DataTypes.STRING
  },
});


WeaverProcess.belongsTo(Season, {
  foreignKey: "season_id",
  as: "season",
});

WeaverProcess.belongsTo(YarnCount, {
  foreignKey: "yarn_count",
  as: "yarncount",
});

WeaverProcess.belongsTo(FabricType, {
  foreignKey: "fabric_type",
  as: "fabric",
});

WeaverProcess.belongsTo(Program, {
  foreignKey: "program_id",
  as: "program",
});

WeaverProcess.belongsTo(Weaver, {
  foreignKey: "weaver_id",
  as: "weaver",
});

WeaverProcess.belongsTo(Dyeing, {
  foreignKey: "dyeing_id",
  as: "dyeing",
});

WeaverProcess.sync();

export default WeaverProcess;