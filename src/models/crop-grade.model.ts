import { DataTypes  } from 'sequelize';
import db  from '../util/dbConn';
import CropVariety from './crop-variety.model'

const CropGrade = db.define('crop_grades',{
  id: {
    type: DataTypes.INTEGER,
    autoIncrement: true,
    allowNull: false,
    primaryKey: true
  },
  cropGrade: {
    type: DataTypes.STRING,
    allowNull: false,
  },
  cropGrade_status: {
    type: DataTypes.BOOLEAN,
    allowNull: false,
    defaultValue: true,
  },
});

CropGrade.belongsTo(CropVariety, {
  foreignKey: "cropVariety_id",
  as: "cropVariety",
})

CropGrade.associate = (models: any) => {
  CropGrade.hasMany(models.Transaction, {
    foreignKey: "grade_id",
    as: "grade",
  });
};

export default CropGrade;
