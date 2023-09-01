import { DataTypes  } from 'sequelize';
import db  from '../util/dbConn';

const UnitCertification = db.define('unit_certifications',{
  id: {
    type: DataTypes.INTEGER,
    autoIncrement: true,
    allowNull: false,
    primaryKey: true
  },
  certification_name: {
    type: DataTypes.STRING,
    allowNull: false,
  },
  certification_logo: {
    type: DataTypes.STRING,
    allowNull: false,
  },
  certification_status: {
    type: DataTypes.BOOLEAN,
    allowNull: false,
    defaultValue: true,
  },
});

export default UnitCertification;