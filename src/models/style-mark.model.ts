import { DataTypes  } from 'sequelize';
import db  from '../util/dbConn';

const StyleMark = db.define('style_mark_nos',{
  id: {
    type: DataTypes.INTEGER,
    autoIncrement: true,
    allowNull: false,
    primaryKey: true
  },
  style_mark_no: {
    type: DataTypes.STRING,
    allowNull: false,
  },
  status: {
    type: DataTypes.BOOLEAN,
    allowNull: false,
    defaultValue: true,
  }
});

StyleMark.sync();

export default StyleMark;