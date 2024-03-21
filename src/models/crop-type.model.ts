import { DataTypes  } from 'sequelize';
import db  from '../util/dbConn';
import Crop from './crop.model'

const CropType = db.define('crop_types',{
  id: {
    type: DataTypes.INTEGER,
    autoIncrement: true,
    allowNull: false,
    primaryKey: true
  },
  cropType_name: {
    type: DataTypes.STRING,
    allowNull: false,
  },
  cropType_status: {
    type: DataTypes.BOOLEAN,
    allowNull: false,
    defaultValue: true,
  },
});

CropType.belongsTo(Crop, {
  foreignKey: "crop_id",
  as: "crop",
})

CropType.associate = (models: any) => {
  CropType.hasMany(models.CropVariety, {
    foreignKey: 'cropType_id',
    as: 'cropType',
  });
};


export default CropType;