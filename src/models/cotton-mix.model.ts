import { DataTypes  } from 'sequelize';
import db  from '../util/dbConn';

const CottonMix = db.define('cotton_mixes',{
  id: {
    type: DataTypes.INTEGER,
    autoIncrement: true,
    allowNull: false,
    primaryKey: true
  },
  cottonMix_name: {
    type: DataTypes.STRING,
    allowNull: false,
  },
  cottonMix_status: {
    type: DataTypes.BOOLEAN,
    allowNull: false,
  },
});

export default CottonMix;