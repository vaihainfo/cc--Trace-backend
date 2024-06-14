import { DataTypes } from 'sequelize';
import db from '../util/dbConn';
import GinSales from './gin-sales.model';
import GinBale from './gin-bale.model';

const BaleSelection = db.define('bale_selections', {
  id: {
    type: DataTypes.INTEGER,
    autoIncrement: true,
    allowNull: false,
    primaryKey: true
  },
  sales_id: {
    type: DataTypes.INTEGER
  },
  bale_id: {
    type: DataTypes.INTEGER
  },
  print: {
    type: DataTypes.BOOLEAN,
    defaultValue: false
  },
  spinner_status: {
    type: DataTypes.BOOLEAN,
    defaultValue: null
  },
});

BaleSelection.belongsTo(GinSales, {
  foreignKey: "sales_id",
  as: "sales",
});

BaleSelection.belongsTo(GinBale, {
  foreignKey: "bale_id",
  as: "bale",
})

BaleSelection.sync();

export default BaleSelection;
