import { DataTypes  } from 'sequelize';
import db  from '../util/dbConn';

import Knitter from './knitter.model';
import Dyeing from './dyeing.model';

const KnitSales = db.define('knit_sales',{
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
    allowNull: false,
    type: DataTypes.INTEGER
  },
  fabric_length: {
    type: DataTypes.DOUBLE
  },
  fabric_gsm: {
    allowNull: false,
    type: DataTypes.STRING
  },
  fabric_weight: {
    allowNull: false,
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
  cottonmix_type: {
    type: DataTypes.STRING
  },
  cottonmix_qty: {
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
  dyeing_required: {
    allowNull: false,
    type: DataTypes.BOOLEAN
  },
  dyeing_id: {
    type: DataTypes.INTEGER,
    references: { model: 'dyeings', key: 'id' },
  },
  status: {
    type: DataTypes.STRING
  },
});

KnitSales.belongsTo(Knitter, {
  foreignKey: "knitter_id",
  as: "knitter",
});

KnitSales.belongsTo(Dyeing, {
  foreignKey: "dyeing_id",
  as: "dyeing",
});

KnitSales.sync();

export default KnitSales;