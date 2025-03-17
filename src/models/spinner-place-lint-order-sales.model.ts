import { DataTypes } from 'sequelize';
import db from '../util/dbConn';
import GinSales from './gin-sales.model';

const SpinnerPlaceLintOrderSales = db.define('spinner_place_lint_orders_sales', {
  id: {
    type: DataTypes.INTEGER,
    autoIncrement: true,
    allowNull: false,
    primaryKey: true
  },
  spinner_place_lint_order_id: {
    type: DataTypes.INTEGER,
    allowNull: false,
    references: {
      model: 'spinner_place_lint_orders',
      key: 'id'
    },
    onUpdate: 'CASCADE',
    onDelete: 'CASCADE'
  },
  ginner_sale_id: {
    type: DataTypes.INTEGER,
    allowNull: false,
    references: {
      model: 'gin_sales',
      key: 'id'
    },
    onUpdate: 'CASCADE',
    onDelete: 'CASCADE'
  },
  quantity_used: {
    type: DataTypes.INTEGER,
    allowNull: false,
    comment: 'Quantity of lint used from the order'
  }
});

// Define association with GinSales
SpinnerPlaceLintOrderSales.belongsTo(GinSales, {
  foreignKey: 'ginner_sale_id',
  as: 'ginSale'
});

export default SpinnerPlaceLintOrderSales;