import { DataTypes } from 'sequelize';
import db from '../util/dbConn';
import Farmer from './farmer.model';

const FarmerAgriArea = db.define('farmer_agri_areas', {
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
  agri_total_area: {
    type: DataTypes.DECIMAL
  },
  agri_estimated_yeld: {
    type: DataTypes.DECIMAL
  },
  agri_estimated_prod: {
    type: DataTypes.DECIMAL
  },
});

FarmerAgriArea.belongsTo(Farmer, {
  foreignKey: "farmer_id",
  as: "farmer",
})


FarmerAgriArea.associate = (models: any) => {
  FarmerAgriArea.hasMany(models.Farm, {
    foreignKey: 'agri_id',
    as: 'farmerAgriArea',
  });
};

export default FarmerAgriArea;