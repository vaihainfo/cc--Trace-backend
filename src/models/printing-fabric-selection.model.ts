import { DataTypes } from 'sequelize';
import db from '../util/dbConn';

const PrintingFabricSelection = db.define('printing_fabric_selections', {
  id: {
    allowNull: false,
    autoIncrement: true,
    primaryKey: true,
    type: DataTypes.INTEGER
  },
  sales_id: {
    type: DataTypes.INTEGER
  },
  process_type: {
    type: DataTypes.STRING
  },
  process_id: {
    type: DataTypes.STRING
  },
  qty_used: {
    type: DataTypes.DOUBLE
  },
});


PrintingFabricSelection.sync();

export default PrintingFabricSelection;