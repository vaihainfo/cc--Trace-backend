import { DataTypes } from 'sequelize';
import db from '../util/dbConn';

const GarmentSelection = db.define('garment_selections', {
  id: {
    type: DataTypes.INTEGER,
    autoIncrement: true,
    allowNull: false,
    primaryKey: true
  },
  garment_id: {
    type: DataTypes.INTEGER
  },
  sales_id: {
    type: DataTypes.INTEGER
  },
  type: {
    type: DataTypes.STRING
  },
  processor: {
    type: DataTypes.STRING
  },
  qty_used: {
    type: DataTypes.DOUBLE
  },
  qty_used_length: {
    type: DataTypes.DOUBLE
  },
  qty_used_weight: {
    type: DataTypes.DOUBLE
  },
});

GarmentSelection.sync();
export default GarmentSelection;