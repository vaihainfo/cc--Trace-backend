import { DataTypes } from 'sequelize';
import db from '../util/dbConn';

import Knitter from './knitter.model';
import Dyeing from './dyeing.model';
import Program from './program.model';
import Season from './season.model';
import YarnCount from './yarn-count.model';
import FabricType from './fabric-type.model';
import Garment from './garment.model';
import Fabric from './fabric.model';

const KnitProcess = db.define('knit_processes', {
  id: {
    type: DataTypes.INTEGER,
    autoIncrement: true,
    allowNull: false,
    primaryKey: true
  },
  knitter_id: {
    type: DataTypes.INTEGER,
    foreignKey: true,
    references: { model: 'knitters', key: 'id' },
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
    type: DataTypes.ARRAY(DataTypes.INTEGER)
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
    type: DataTypes.ARRAY(DataTypes.INTEGER)
  },
  fabric_weight: {
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
  total_fabric_weight: {
    type: DataTypes.DOUBLE
  },
  status: {
    type: DataTypes.STRING
  },
});


KnitProcess.belongsTo(Season, {
  foreignKey: "season_id",
  as: "season",
});

KnitProcess.belongsTo(YarnCount, {
  foreignKey: "yarn_count",
  as: "yarncount",
});

KnitProcess.belongsTo(FabricType, {
  foreignKey: "fabric_type",
  as: "fabric",
});

KnitProcess.belongsTo(Program, {
  foreignKey: "program_id",
  as: "program",
});

KnitProcess.belongsTo(Knitter, {
  foreignKey: "knitter_id",
  as: "knitter",
});

KnitProcess.belongsTo(Dyeing, {
  foreignKey: "dyeing_id",
  as: "dyeing",
});

KnitProcess.sync();

export default KnitProcess;