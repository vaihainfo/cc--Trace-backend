import { DataTypes } from 'sequelize';
import db from '../util/dbConn';
import Farmer from './farmer.model';

const FarmerCottonArea = db.define('farmer_cotton_areas', {
  id: {
    type: DataTypes.INTEGER,
    autoIncrement: true,
    allowNull: false,
    primaryKey: true
  },
  farmer_id: {
    type: DataTypes.INTEGER,
    foreignKey: true,
    references: { model: 'farmers', key: 'id' },
    onDelete: 'CASCADE',
    allowNull: false,
  },
  cotton_total_area: {
    type: DataTypes.DECIMAL
  },
  total_estimated_cotton: {
    type: DataTypes.DECIMAL
  },
});

FarmerCottonArea.belongsTo(Farmer, {
  foreignKey: "farmer_id",
  as: "farmer",
})

export default FarmerCottonArea;