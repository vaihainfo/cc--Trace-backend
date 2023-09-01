import { DataTypes } from 'sequelize';
import db from '../util/dbConn';

const Crop = db.define('crops', {
  id: {
    type: DataTypes.INTEGER,
    autoIncrement: true,
    allowNull: false,
    primaryKey: true
  },
  crop_name: {
    type: DataTypes.STRING,
    allowNull: false,
  },
  crop_status: {
    type: DataTypes.BOOLEAN,
    allowNull: false,
    defaultValue: true,
  },
});

Crop.associate = (models: any) => {
  Crop.hasMany(models.CropType, {
    foreignKey: 'crop_id',
    as: 'crop',
  });
};


export default Crop;