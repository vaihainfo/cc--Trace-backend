import { DataTypes } from 'sequelize';
import db from '../util/dbConn';
import SpinProcess from './spin-process.model';
import SpinSales from './spin-sales.model';
import SpinYarn from './spin-yarn.model';

const SpinSaleYarnSelected = db.define('spin_sale_yarn_selecteds', {
  id: {
    type: DataTypes.INTEGER,
    autoIncrement: true,
    allowNull: false,
    primaryKey: true
  },
  sales_id: {
    type: DataTypes.INTEGER,
    allowNull: false,
    foreignKey: true,
    references: { model: 'spin_sales', key: 'id' },
    onDelete: 'CASCADE',
  },
  process_id: {
    type: DataTypes.INTEGER,
    allowNull: false,
    foreignKey: true,
    references: { model: 'spin_processes', key: 'id' },
    onDelete: 'CASCADE',
  },
  yarn_id: {
    type: DataTypes.INTEGER,
    allowNull: false,
    foreignKey: true,
    references: { model: 'spin_yarns', key: 'id' },
    onDelete: 'CASCADE',
  },
  batch_lot_no: {
    type: DataTypes.STRING
  },
  box_id: {
    type: DataTypes.STRING
  },
  no_of_boxes: {
    type: DataTypes.DOUBLE
  },
  price: {
    type: DataTypes.DOUBLE
  },
});

SpinSaleYarnSelected.belongsTo(SpinProcess, {
  foreignKey: "spin_process_id",
  as: "process",
});

SpinSaleYarnSelected.belongsTo(SpinYarn, {
  foreignKey: "yarn_id",
  as: "spinyarn",
});

SpinSaleYarnSelected.belongsTo(SpinSales, {
  foreignKey: "sales_id",
  as: "sales",
});

SpinSaleYarnSelected.sync();

export default SpinSaleYarnSelected;
