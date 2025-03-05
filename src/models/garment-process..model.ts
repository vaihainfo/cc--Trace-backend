import { DataTypes } from 'sequelize';
import db from '../util/dbConn';

import Garment from './garment.model';
import Embroidering from './embroidering.model';
import Program from './program.model';
import Season from './season.model';
import Department from './department.model';

const GarmentProcess = db.define('garment_processes', {
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
  fabric_order_ref: {
    type: DataTypes.STRING
  },
  brand_order_ref: {
    type: DataTypes.STRING
  },
  fabric_weight: {
    type: DataTypes.DOUBLE
  },
  additional_fabric_weight: {
    type: DataTypes.DOUBLE
  },
  total_fabric_weight: {
    type: DataTypes.DOUBLE
  },
  fabric_length: {
    type: DataTypes.DOUBLE
  },
  additional_fabric_length: {
    type: DataTypes.DOUBLE
  },
  total_fabric_length: {
    type: DataTypes.DOUBLE
  },
  factory_lot_no: {
    type: DataTypes.STRING
  },
  reel_lot_no: {
    type: DataTypes.STRING
  },
  total_waste_perct: {
    type: DataTypes.DOUBLE
  },
  waste_weight: {
    type: DataTypes.DOUBLE
  },
  waste_length: {
    type: DataTypes.DOUBLE
  },
  waste_fabric_sold_to: {
    type: DataTypes.STRING
  },
  waste_fabric_invoice: {
    type: DataTypes.STRING
  },
  garment_type: {
    type: DataTypes.ARRAY(DataTypes.STRING)
  },
  style_mark_no: {
    type: DataTypes.ARRAY(DataTypes.STRING)
  },
  garment_size: {
    type: DataTypes.ARRAY(DataTypes.STRING)
  },
  color: {
    type: DataTypes.ARRAY(DataTypes.STRING)
  },
  no_of_pieces: {
    type: DataTypes.ARRAY(DataTypes.DOUBLE)
  },
  no_of_boxes: {
    type: DataTypes.ARRAY(DataTypes.DOUBLE)
  },
  finished_garment_image: {
    type: DataTypes.ARRAY(DataTypes.STRING)
  },
  qty_stock: {
    type: DataTypes.DOUBLE
  },
  qty_stock_weight: {
    type: DataTypes.DOUBLE
  },
  qty_stock_length: {
    type: DataTypes.DOUBLE
  },
  total_qty: {
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
  physical_traceablity: {
    type: DataTypes.BOOLEAN
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
  from_date: {
    type: DataTypes.DATE,
    allowNull: true,
    defaultValue: null,
  },
  to_date: {
    type: DataTypes.DATE,
    allowNull: true,
    defaultValue: null,
  },
});

GarmentProcess.belongsTo(Garment, {
  foreignKey: "garment_id",
  as: "garment",
});

GarmentProcess.belongsTo(Program, {
  foreignKey: "program_id",
  as: "program",
});

GarmentProcess.belongsTo(Department, {
  foreignKey: "department_id",
  as: "department",
});

GarmentProcess.belongsTo(Season, {
  foreignKey: "season_id",
  as: "season",
});

GarmentProcess.belongsTo(Embroidering, {
  foreignKey: "embroidering_id",
  as: "embroidering",
});

GarmentProcess.sync();

export default GarmentProcess;

