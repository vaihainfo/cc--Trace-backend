import { DataTypes } from 'sequelize';
import db from '../util/dbConn';
import Trader from './trader.model';
import Brand from './brand.model';
import Embroidering from './embroidering.model';
import Season from './season.model';
import Department from './department.model';
import Program from './program.model';

const TraderSales = db.define('trader_sales', {
  id: {
    allowNull: false,
    autoIncrement: true,
    primaryKey: true,
    type: DataTypes.INTEGER
  },
  trader_id: {
    type: DataTypes.INTEGER,
    foreignKey: true,
    references: { model: 'traders', key: 'id' },
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
  processor_id: {
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
    type: DataTypes.DOUBLE
  },
  batch_lot_no: {
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
  total_qty: {
    type: DataTypes.DOUBLE
  },
  qty_stock: {
    type: DataTypes.DOUBLE
  },
  embroidering_required: {
    type: DataTypes.BOOLEAN
  },
  embroidering_id: {
    type: DataTypes.INTEGER,
    references: { model: 'embroiderings', key: 'id' },
  },
  status: {
    type: DataTypes.STRING
  },
  qr: {
    type: DataTypes.STRING,
  },
  accept_date: {
    type: DataTypes.DATE,
  }
});


TraderSales.belongsTo(Program, {
  foreignKey: "program_id",
  as: "program",
});

TraderSales.belongsTo(Department, {
  foreignKey: "department_id",
  as: "department",
});

TraderSales.belongsTo(Season, {
  foreignKey: "season_id",
  as: "season",
});

TraderSales.belongsTo(Embroidering, {
  foreignKey: "embroidering_id",
  as: "embroidering",
});

TraderSales.belongsTo(Trader, {
  foreignKey: "trader_id",
  as: "trader",
});


TraderSales.belongsTo(Brand, {
  foreignKey: "buyer_id",
  as: "buyer",
});

TraderSales.sync();

export default TraderSales;


