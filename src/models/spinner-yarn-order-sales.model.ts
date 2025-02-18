import { DataTypes } from 'sequelize';
import db from '../util/dbConn';

const SpinnerYarnOrderSales = db.define('spinner_yarn_order_sales', {
  id: {
    type: DataTypes.INTEGER,
    autoIncrement: true,
    allowNull: false,
    primaryKey: true
  },
  spinner_yarn_order_id: {
    type: DataTypes.INTEGER,
    allowNull: false,
    references: {
      model: 'spinner_yarn_orders',
      key: 'id'
    },
    onUpdate: 'CASCADE',
    onDelete: 'CASCADE'
  },
  sale_id: {
    type: DataTypes.INTEGER,
    allowNull: false
  },
  quantity_used: {
    type: DataTypes.DECIMAL(10, 2),
    allowNull: false,
    comment: 'Quantity of yarn used from the order'
  }
});

export default SpinnerYarnOrderSales;
