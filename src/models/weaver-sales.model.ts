import { DataTypes } from 'sequelize';
import db from '../util/dbConn';

import Weaver from './weaver.model';
import Dyeing from './dyeing.model';
import FabricType from './fabric-type.model';
import Garment from './garment.model';
import Season from './season.model';
import Program from './program.model';
import Fabric from './fabric.model';

const WeaverSales = db.define('weaver_sales', {
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
  buyer_type: {
    allowNull: false,
    type: DataTypes.STRING
  },
  buyer_id: {
    type: DataTypes.INTEGER
  },
  fabric_id: {
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
    type: DataTypes.DOUBLE
  },
  total_fabric_length: {
    type: DataTypes.DOUBLE
  },
  fabric_type: {
    type: DataTypes.ARRAY(DataTypes.INTEGER)
  },
  no_of_rolls: {
    type: DataTypes.INTEGER
  },
  batch_lot_no: {
    allowNull: false,
    type: DataTypes.STRING
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
  qr: {
    type: DataTypes.STRING
  },
  accept_date: {
    type: DataTypes.DATE
  }
});

WeaverSales.belongsTo(Weaver, {
  foreignKey: "weaver_id",
  as: "weaver",
});

WeaverSales.belongsTo(Garment, {
  foreignKey: "buyer_id",
  as: "buyer",
});

WeaverSales.belongsTo(Fabric, {
  foreignKey: "fabric_id",
  as: "dyingwashing",
});

WeaverSales.belongsTo(FabricType, {
  foreignKey: "fabric_type",
  as: "fabric",
});

WeaverSales.belongsTo(Season, {
  foreignKey: "season_id",
  as: "season",
});

WeaverSales.belongsTo(Program, {
  foreignKey: "program_id",
  as: "program",
});

WeaverSales.sync();

export default WeaverSales;