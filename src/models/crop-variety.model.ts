import { DataTypes  } from 'sequelize';
import db  from '../util/dbConn';
import CropType from './crop-type.model'

const CropVariety = db.define('crop_varieties',{
  id: {
    type: DataTypes.INTEGER,
    autoIncrement: true,
    allowNull: false,
    primaryKey: true
  },
  cropVariety: {
    type: DataTypes.STRING,
    allowNull: false,
  },
  cropVariety_status: {
    type: DataTypes.BOOLEAN,
    allowNull: false,
    defaultValue: true,
  },
});

CropVariety.belongsTo(CropType, {
  foreignKey: "cropType_id",
  as: "cropType",
})

CropVariety.associate = (models: any) => {
  CropVariety.hasMany(models.CropGrade, {
    foreignKey: 'cropVariety_id',
    as: 'cropVariety',
  });
};


export default CropVariety;