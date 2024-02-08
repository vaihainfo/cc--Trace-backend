import { DataTypes } from 'sequelize';
import db from '../util/dbConn';

import Spinner from './spinner.model';
import Season from './season.model';
import Program from './program.model';
import Knitter from './knitter.model';
import Weaver from './weaver.model';
import YarnCount from './yarn-count.model';
import Trader from './trader.model';

const SpinSales = db.define('spin_sales', {
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
  order_ref: {
    type: DataTypes.STRING
  },
  buyer_type: {
    allowNull: false,
    type: DataTypes.STRING
  },
  buyer_id: {
    type: DataTypes.INTEGER
  },
  processor_name: {
    type: DataTypes.STRING
  },
  processor_address: {
    type: DataTypes.STRING
  },
  trader_id: {
    type: DataTypes.INTEGER
  },
  transaction_via_trader: {
    allowNull: false,
    type: DataTypes.BOOLEAN
  },
  transaction_agent: {
    type: DataTypes.STRING
  },
  total_qty: {
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
  box_ids: {
    type: DataTypes.STRING
  },
  yarn_type: {
    type: DataTypes.STRING
  },
  yarn_count: {
    type: DataTypes.DOUBLE
  },
  invoice_no: {
    allowNull: false,
    type: DataTypes.STRING
  },
  bill_of_ladding: {
    allowNull: false,
    type: DataTypes.STRING
  },
  transporter_name: {
    allowNull: false,
    type: DataTypes.STRING
  },
  vehicle_no: {
    allowNull: false,
    type: DataTypes.STRING
  },
  quality_doc: {
    type: DataTypes.STRING
  },
  tc_files: {
    type: DataTypes.STRING
  },
  contract_file: {
    type: DataTypes.STRING
  },
  invoice_file: {
    type: DataTypes.ARRAY(DataTypes.TEXT)
  },
  delivery_notes: {
    type: DataTypes.STRING
  },
  qty_stock: {
    type: DataTypes.DOUBLE
  },
  status: {
    type: DataTypes.STRING
  },
  accept_date: {
    type: DataTypes.DATE
  },
  qr: {
    type: DataTypes.STRING
  },
  knitter_id: {
    type: DataTypes.INTEGER
  }
});

SpinSales.belongsTo(Spinner, {
  foreignKey: "spinner_id",
  as: "spinner",
});

SpinSales.belongsTo(Season, {
  foreignKey: "season_id",
  as: "season",
});

SpinSales.belongsTo(YarnCount, {
  foreignKey: "yarn_count",
  as: "yarncount",
});

SpinSales.belongsTo(Program, {
  foreignKey: "program_id",
  as: "program",
});

SpinSales.belongsTo(Knitter, {
  foreignKey: "knitter_id",
  as: "knitter",
});

SpinSales.belongsTo(Weaver, {
  foreignKey: "buyer_id",
  as: "weaver",
});

SpinSales.belongsTo(Trader, {
  foreignKey: "trader_id",
  as: "trader",
});

SpinSales.sync();

export default SpinSales;