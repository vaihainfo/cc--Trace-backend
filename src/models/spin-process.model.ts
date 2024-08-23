import { DataTypes } from 'sequelize';
import db from '../util/dbConn';

import Spinner from './spinner.model';
import Dyeing from './dyeing.model';
import Program from './program.model';
import Season from './season.model';
import YarnCount from './yarn-count.model';

const SpinProcess = db.define('spin_processes', {
  id: {
    type: DataTypes.INTEGER,
    autoIncrement: true,
    allowNull: false,
    primaryKey: true
  },
  spinner_id: {
    type: DataTypes.INTEGER,
    foreignKey: true,
    references: { model: 'spinners', key: 'id' },
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
    allowNull: false,
    type: DataTypes.STRING
  },
  total_qty: {
    allowNull: false,
    type: DataTypes.DOUBLE
  },
  yarn_count: {
    allowNull: false,
    type: DataTypes.ARRAY(DataTypes.INTEGER)
  },
  yarn_qty_produced: {
    allowNull: false,
    type: DataTypes.ARRAY(DataTypes.DOUBLE)
  },
  yarn_realisation: {
    allowNull: false,
    type: DataTypes.DOUBLE
  },
  net_yarn_qty: {
    type: DataTypes.DOUBLE
  },
  comber_noil: {
    type: DataTypes.DOUBLE
  },
  no_of_boxes: {
    type: DataTypes.INTEGER
  },
  batch_lot_no: {
    allowNull: false,
    type: DataTypes.STRING
  },
  reel_lot_no: {
    type: DataTypes.STRING
  },
  box_id: {
    type: DataTypes.STRING
  },
  process_complete: {
    allowNull: false,
    type: DataTypes.BOOLEAN
  },
  dyeing_required: {
    allowNull: false,
    type: DataTypes.BOOLEAN
  },
  qty_stock: {
    type: DataTypes.DOUBLE
  },
  status: {
    type: DataTypes.STRING
  },
  dyeing_id: {
    type: DataTypes.INTEGER,
    references: { model: 'dyeings', key: 'id' },
  },
  accept_date: {
    type: DataTypes.DATE,
  },
  tot_box_user: {
    type: DataTypes.INTEGER
  },
  display_order: {
    type: DataTypes.INTEGER
  },
  qr: {
    type: DataTypes.STRING
  },
  comber_noil_stock: {
    type: DataTypes.DOUBLE
  },
  greyout_status: {
    type: DataTypes.BOOLEAN,
    defaultValue: false,
  },
});


SpinProcess.belongsTo(Season, {
  foreignKey: "season_id",
  as: "season",
});

SpinProcess.belongsTo(YarnCount, {
  foreignKey: "yarn_count",
  as: "yarncount",
});

SpinProcess.belongsTo(Program, {
  foreignKey: "program_id",
  as: "program",
});

SpinProcess.belongsTo(Spinner, {
  foreignKey: "spinner_id",
  as: "spinner",
});

SpinProcess.belongsTo(Dyeing, {
  foreignKey: "dyeing_id",
  as: "dyeing",
});

SpinProcess.sync();

export default SpinProcess;