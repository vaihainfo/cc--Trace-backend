import { DataTypes } from 'sequelize';
import db from '../util/dbConn';

import Knitter from './knitter.model';
import Dyeing from './dyeing.model';
import Program from './program.model';
import FabricType from './fabric-type.model';
import Season from './season.model';
import Garment from './garment.model';
import Fabric from './fabric.model';

const KnitSales = db.define('knit_sales', {
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
  transaction_via_trader: {
    allowNull: false,
    type: DataTypes.BOOLEAN
  },
  transaction_agent: {
    type: DataTypes.STRING
  },
  yarn_qty: {
    type: DataTypes.DOUBLE
  },
  total_yarn_qty: {
    allowNull: false,
    type: DataTypes.DOUBLE
  },
  total_fabric_weight: {
    type: DataTypes.DOUBLE
  },
  fabric_type: {
    type: DataTypes.ARRAY(DataTypes.INTEGER)
  },
  batch_lot_no: {
    allowNull: false,
    type: DataTypes.STRING
  },
  reel_lot_no: {
    type: DataTypes.STRING
  },
  no_of_rolls: {
    type: DataTypes.INTEGER
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
  tc_file: {
    type: DataTypes.STRING
  },
  contract_file: {
    type: DataTypes.STRING
  },
  invoice_file: {
    type: DataTypes.ARRAY(DataTypes.STRING)
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
  fabric_id: {
    type: DataTypes.INTEGER
  },
});

KnitSales.belongsTo(Knitter, {
  foreignKey: "knitter_id",
  as: "knitter",
});

KnitSales.belongsTo(Fabric, {
  foreignKey: "fabric_id",
  as: "dyingwashing",
});

// KnitSales.belongsTo(FabricType, {
//   foreignKey: "fabric_type",
//   as: "fabric",
// });

KnitSales.belongsTo(Program, {
  foreignKey: "program_id",
  as: "program",
});

KnitSales.belongsTo(Season, {
  foreignKey: "season_id",
  as: "season",
});

KnitSales.belongsTo(Garment, {
  foreignKey: "buyer_id",
  as: "buyer",
});


KnitSales.sync();

export default KnitSales;