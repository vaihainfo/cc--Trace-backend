import { DataTypes  } from 'sequelize';
import db  from '../util/dbConn';

import Garment from './garment.model';
import Embroidering from './embroidering.model';

const GarmentSales = db.define('garment_sales',{
  id: {
    type: DataTypes.INTEGER,
    autoIncrement: true,
    allowNull: false,
    primaryKey: true
  },
  garment_id: {
    type: DataTypes.INTEGER,
    foreignKey: true,
    references: { model: 'garments', key: 'id' },
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
  department_id: {
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
  trader_id: {
    type: DataTypes.INTEGER
  },
  processor_name: {
    type: DataTypes.STRING
  },
  processor_address: {
    type: DataTypes.STRING
  },
  fabric_length: {
    type: DataTypes.DOUBLE
  },
  additional_fabric_length: {
    type: DataTypes.DOUBLE
  },
  total_fabric_length: {
    allowNull: false,
    type: DataTypes.DOUBLE
  },
  transaction_via_trader: {
    allowNull: false,
    type: DataTypes.BOOLEAN
  },
  transaction_agent: {
    type: DataTypes.STRING
  },
  garment_type: {
    allowNull: false,
    type: DataTypes.STRING
  },
  style_mark_no: {
    allowNull: false,
    type: DataTypes.STRING
  },
  garment_size: {
    allowNull: false,
    type: DataTypes.STRING
  },
  color: {
    type: DataTypes.STRING
  },
  no_of_pieces: {
    allowNull: false,
    type: DataTypes.INTEGER
  },
  no_of_boxes: {
    type: DataTypes.INTEGER
  },
  invoice_no: {
    allowNull: false,
    type: DataTypes.STRING
  },
  box_ids: {
    type: DataTypes.STRING
  },
  bill_of_ladding: {
    type: DataTypes.STRING
  },
  transport_info: {
    type: DataTypes.STRING
  },
  contract_no: {
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
  embroidering_required: {
    allowNull: false,
    type: DataTypes.BOOLEAN
  },
  embroidering_id: {
    type: DataTypes.INTEGER,
    references: { model: 'embroiderings', key: 'id' },
  },
  status: {
    type: DataTypes.STRING
  },
});

GarmentSales.belongsTo(Garment, {
  foreignKey: "garment_id",
  as: "garment",
});

GarmentSales.belongsTo(Embroidering, {
  foreignKey: "embroidering_id",
  as: "embroidering",
});

GarmentSales.sync();

export default GarmentSales;