import { DataTypes } from 'sequelize';
import db from '../util/dbConn';

const KnitYarnSelection = db.define('knit_yarn_selections', {
  id: {
    type: DataTypes.INTEGER,
    autoIncrement: true,
    allowNull: false,
    primaryKey: true
  },
  yarn_id: {
    type: DataTypes.INTEGER
  },
  sales_id: {
    type: DataTypes.INTEGER
  },
  type: {
    type: DataTypes.STRING
  },
  qty_used: {
    type: DataTypes.DOUBLE
  },
});

KnitYarnSelection.sync();
export default KnitYarnSelection;