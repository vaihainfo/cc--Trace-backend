import { DataTypes } from 'sequelize';
import db from '../util/dbConn';

import Ginner from './ginner.model';
import GinProcess from './gin-process.model';
import GinBale from './gin-bale.model';
import GinSales from './gin-sales.model';

const GinToGinSale = db.define('gin_to_gin_sales', {
  id: {
    type: DataTypes.INTEGER,
    autoIncrement: true,
    allowNull: false,
    primaryKey: true
  },
  sales_id: {
    allowNull: false,
    type: DataTypes.INTEGER
  },
  process_id: {
    allowNull: false,
    type: DataTypes.INTEGER
  },
  bale_id: {
    allowNull: false,
    type: DataTypes.INTEGER
  },
  bale_weight: {
    type: DataTypes.DOUBLE
  },
  old_ginner_id: {
    type: DataTypes.INTEGER
  },
  new_ginner_id: {
    type: DataTypes.INTEGER
  },
  gin_accepted_status: {
    type: DataTypes.BOOLEAN
  },
  gin_sold_status: {
    type: DataTypes.BOOLEAN
  },
  old_gin_sales_id: {
    type: DataTypes.INTEGER
  },
});

GinToGinSale.belongsTo(Ginner, {
  foreignKey: "old_ginner_id",
  as: "old_ginner",
});

GinToGinSale.belongsTo(Ginner, {
  foreignKey: "new_ginner_id",
  as: "new_ginner",
});

GinToGinSale.belongsTo(GinProcess, {
  foreignKey: "process_id",
  as: "ginprocess",
});

GinToGinSale.belongsTo(GinBale, {
  foreignKey: "bale_id",
  as: "bale",
});

GinToGinSale.belongsTo(GinSales, {
  foreignKey: "sales_id",
  as: "ginsales",
});

GinToGinSale.belongsTo(GinSales, {
  foreignKey: "old_gin_sales_id",
  as: "old_ginsales",
});


GinToGinSale.sync();

export default GinToGinSale;