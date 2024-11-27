import { DataTypes } from 'sequelize';
import db from '../util/dbConn';

import GinProcess from './gin-process.model';
import GinSales from './gin-sales.model';

const GinBale = db.define('gin-bales', {
  id: {
    type: DataTypes.INTEGER,
    autoIncrement: true,
    allowNull: false,
    primaryKey: true
  },
  process_id: {
    type: DataTypes.INTEGER,
    allowNull: false,
  },
  bale_no: {
    type: DataTypes.STRING
  },
  weight: {
    type: DataTypes.STRING
  },
  staple: {
    type: DataTypes.STRING
  },
  mic: {
    type: DataTypes.STRING
  },
  strength: {
    type: DataTypes.STRING
  },
  trash: {
    type: DataTypes.STRING
  },
  color_grade: {
    type: DataTypes.STRING
  },
  qr: {
    type: DataTypes.STRING
  },
  sold_status: {
    type: DataTypes.BOOLEAN,
    defaultValue: false
  },
  old_weight: {
    type: DataTypes.STRING
  },
  is_all_rejected: {
    type: DataTypes.BOOLEAN,
  },
  accepted_weight: {
    type: DataTypes.DOUBLE
  },
  te_verified_status: {
    type: DataTypes.BOOLEAN,
  },
  te_verified_weight: {
    type: DataTypes.DOUBLE
  },
  gin_verified_status: {
    type: DataTypes.BOOLEAN,
  },
  gin_verified_weight: {
    type: DataTypes.DOUBLE
  },
  scm_verified_status: {
    type: DataTypes.BOOLEAN,
  },
  scm_verified_weight: {
    type: DataTypes.DOUBLE
  },
  scd_verified_status: {
    type: DataTypes.BOOLEAN,
  },
  scd_verified_weight: {
    type: DataTypes.DOUBLE
  },
  te_sale_verified_status: {
    type: DataTypes.BOOLEAN,
  },
  te_sale_verified_weight: {
    type: DataTypes.DOUBLE
  },
  be_verified_status: {
    type: DataTypes.BOOLEAN,
  },
  be_verified_weight: {
    type: DataTypes.DOUBLE
  },
  spin_verified_status: {
    type: DataTypes.BOOLEAN,
  },
  spin_verified_weight: {
    type: DataTypes.DOUBLE
  },
  bm_verified_status: {
    type: DataTypes.BOOLEAN,
  },
  bm_verified_weight: {
    type: DataTypes.DOUBLE
  },
  ps_verified_status: {
    type: DataTypes.BOOLEAN,
  },
  ps_verified_weight: {
    type: DataTypes.DOUBLE
  },
  gin_level_verify: {
    type: DataTypes.BOOLEAN,
  },
  spin_level_verify: {
    type: DataTypes.BOOLEAN,
  },
  is_gin_to_gin_sale: {
    type: DataTypes.BOOLEAN,
  },
  gin_to_gin_status: {
    type: DataTypes.BOOLEAN,
  },
  sold_by_sales_id: {
    type: DataTypes.INTEGER,
  },
});

GinBale.belongsTo(GinProcess, {
  foreignKey: "process_id",
  as: "ginprocess",
});

GinBale.belongsTo(GinSales, {
  foreignKey: "sold_by_sales_id",
  as: "ginsales",
});


GinBale.sync();

export default GinBale;