import { DataTypes } from 'sequelize';
import db from '../util/dbConn';
import GarmentProcess from './garment-process..model';

const GarmentFabricType = db.define('garment_fabric_types', {
  id: {
    type: DataTypes.INTEGER,
    autoIncrement: true,
    allowNull: false,
    primaryKey: true
  },
  process_id: {
    type: DataTypes.INTEGER
  },
  garment_type: {
    type: DataTypes.STRING
  },
  style_mark_no: {
    type: DataTypes.STRING
  },
  garment_size: {
    type: DataTypes.STRING
  },
  no_of_boxes: {
    type: DataTypes.DOUBLE
  },
  color: {
    type: DataTypes.STRING
  },
  no_of_pieces: {
    type: DataTypes.DOUBLE
  },
  no_of_pieces_stock: {
    type: DataTypes.DOUBLE
  },
  finished_garment_image: {
    type: DataTypes.STRING
  },
  sold_status: {
    type: DataTypes.BOOLEAN
  }
});

GarmentFabricType.belongsTo(GarmentProcess, {
  foreignKey: "process_id",
  as: "process",
});


GarmentFabricType.sync();
export default GarmentFabricType;