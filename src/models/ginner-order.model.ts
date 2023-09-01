import { DataTypes  } from 'sequelize';
import db  from '../util/dbConn';
import Ginner from './ginner.model';

const GinnerOrder = db.define('ginner_orders',{
  id: {
    type: DataTypes.INTEGER,
    autoIncrement: true,
    allowNull: false,
    primaryKey: true
  },
  season_id: {
    type: DataTypes.INTEGER
  },
  upload_date: {
    type: DataTypes.DATE
  },
  ginner_id: {
    type: DataTypes.INTEGER,
    references: { model: 'ginners', key: 'id' },
    onDelete: 'CASCADE',
  },
  ginning_mill: {
    type: DataTypes.STRING
  },
  brand_id: {
    type: DataTypes.INTEGER
  },
  program_id: {
    type: DataTypes.INTEGER
  },
  confirmed_bales: {
    type: DataTypes.STRING
  },
  confirmed_lint_order: {
    type: DataTypes.STRING
  },
});

GinnerOrder.belongsTo(Ginner, {
  foreignKey: "ginner_id",
  as: "ginner_order",
});

GinnerOrder.sync();

export default GinnerOrder;