import { DataTypes } from 'sequelize';
import db from '../util/dbConn';

import Weaver from './weaver.model';
import Dyeing from './dyeing.model';
import FabricType from './fabric-type.model';
import Garment from './garment.model';
import Season from './season.model';
import Program from './program.model';

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
  transaction_via_trader: {
    allowNull: false,
    type: DataTypes.BOOLEAN
  },
  transaction_agent: {
    type: DataTypes.STRING
  },
  warn_yarn_qty: {
    type: DataTypes.DOUBLE
  },
  weft_choosen: {
    allowNull: false,
    type: DataTypes.STRING
  },
  weft_cottonmix_type: {
    type: DataTypes.ARRAY(DataTypes.INTEGER)
  },
  weft_cottonmix_qty: {
    type: DataTypes.ARRAY(DataTypes.DOUBLE)
  },
  weft_yarn_qty: {
    type: DataTypes.DOUBLE
  },
  total_yarn_qty: {
    type: DataTypes.DOUBLE
  },
  fabric_type: {
    allowNull: false,
    type: DataTypes.INTEGER
  },
  fabric_contruction: {
    allowNull: false,
    type: DataTypes.STRING
  },
  fabric_length: {
    allowNull: false,
    type: DataTypes.DOUBLE
  },
  fabric_gsm: {
    allowNull: false,
    type: DataTypes.STRING
  },
  fabric_weight: {
    type: DataTypes.DOUBLE
  },
  batch_lot_no: {
    allowNull: false,
    type: DataTypes.STRING
  },
  job_details_garment: {
    type: DataTypes.STRING
  },
  bale_ids: {
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
    type: DataTypes.STRING
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
  dyeing_required: {
    allowNull: false,
    type: DataTypes.BOOLEAN
  },
  dyeing_id: {
    type: DataTypes.INTEGER,
    references: { model: 'dyeings', key: 'id' },
  },
  qr: {
    type: DataTypes.STRING
  },
  no_of_bales: {
    type: DataTypes.DOUBLE
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

WeaverSales.belongsTo(FabricType, {
  foreignKey: "fabric_type",
  as: "fabric",
});

WeaverSales.belongsTo(Dyeing, {
  foreignKey: "dyeing_id",
  as: "dyeing",
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