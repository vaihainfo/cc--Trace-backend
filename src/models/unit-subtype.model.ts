import { DataTypes  } from 'sequelize';
import db  from '../util/dbConn';
import UnitType from './unit-type.model'

const UnitSubType = db.define('unit_subtypes',{
  id: {
    type: DataTypes.INTEGER,
    autoIncrement: true,
    allowNull: false,
    primaryKey: true
  },
  unitSubType: {
    type: DataTypes.STRING,
    allowNull: false,
  },
  unitSubType_status: {
    type: DataTypes.BOOLEAN,
    allowNull: false,
    defaultValue: true,
  },
});

UnitSubType.belongsTo(UnitType, {
  foreignKey: "unitType_id",
  as: "unitType",
})

export default UnitSubType;