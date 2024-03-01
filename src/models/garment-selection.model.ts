import { DataTypes } from 'sequelize';
import db from '../util/dbConn';
import GarmentProcess from './garment-process..model';
import GarmentSales from './garment-sales.model';
import GarmentFabricType from './garment_fabric_type.model';

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
  garment_type_id :{
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

GarmentSelection.belongsTo(GarmentProcess, {
  foreignKey: "garment_id",
  as: "garmentprocess",
});

GarmentSelection.belongsTo(GarmentSales, {
  foreignKey: "sales_id",
  as: "garmentsales",
});

GarmentSelection.belongsTo(GarmentFabricType, {
  foreignKey: "garment_type_id",
  as: "garmenttype",
});

GarmentSelection.sync();
export default GarmentSelection;