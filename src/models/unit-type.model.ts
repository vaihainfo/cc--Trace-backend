import { DataTypes } from 'sequelize';
import db from '../util/dbConn';

const UnitType = db.define('unit_types', {
  id: {
    type: DataTypes.INTEGER,
    autoIncrement: true,
    allowNull: false,
    primaryKey: true
  },
  unitType: {
    type: DataTypes.STRING,
    allowNull: false,
  },
  unitType_status: {
    type: DataTypes.BOOLEAN,
    allowNull: false,
    defaultValue: true,
  },
});

UnitType.associate = (models: any) => {
  UnitType.hasMany(models.UnitSubType, {
    foreignKey: 'unitType_id',
    as: 'unitType',
  });
};


export default UnitType;