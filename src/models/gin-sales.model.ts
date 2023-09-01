import { DataTypes  } from 'sequelize';
import db  from '../util/dbConn';

import Ginner from './ginner.model';

const GinSales = db.define('gin_sales',{
  id: {
    type: DataTypes.INTEGER,
    autoIncrement: true,
    allowNull: false,
    primaryKey: true
  },
  ginner_id: {
    type: DataTypes.INTEGER,
    foreignKey: true,
    references: { model: 'ginners', key: 'id' },
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
  total_qty: {
    type: DataTypes.DOUBLE
  },
  no_of_bales: {
    type: DataTypes.INTEGER
  },
  choosen_bale: {
    type: DataTypes.STRING
  },
  lot_no: {
    type: DataTypes.STRING
  },
  buyer: {
    allowNull: false,
    type: DataTypes.INTEGER
  },
  shipping_address: {
    allowNull: false,
    type: DataTypes.STRING
  },
  transaction_via_trader: {
    allowNull: false,
    type: DataTypes.BOOLEAN
  },
  transaction_agent: {
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
  candy_rate: {
    allowNull: false,
    type: DataTypes.STRING
  },
  rate: {
    allowNull: false,
    type: DataTypes.STRING
  },
  sale_value: {
    type: DataTypes.STRING
  },
  invoice_no: {
    type: DataTypes.STRING
  },
  despatch_from: {
    allowNull: false,
    type: DataTypes.STRING
  },
  despatch_to: {
    type: DataTypes.STRING
  },
  status: {
    type: DataTypes.STRING
  },
});

GinSales.belongsTo(Ginner, {
  foreignKey: "ginner_id",
  as: "ginner",
});

GinSales.sync();

export default GinSales;