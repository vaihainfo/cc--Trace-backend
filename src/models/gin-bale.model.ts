import { DataTypes } from 'sequelize';
import db from '../util/dbConn';

import GinProcess from './gin-process.model';

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
  }
});

GinBale.belongsTo(GinProcess, {
  foreignKey: "process_id",
  as: "ginprocess",
});

GinBale.sync();

export default GinBale;