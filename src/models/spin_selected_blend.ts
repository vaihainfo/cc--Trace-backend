import { DataTypes } from 'sequelize';
import db from '../util/dbConn';

const SpinSelectedBlend = db.define('spin_selected_blends', {
  id: {
    allowNull: false,
    autoIncrement: true,
    primaryKey: true,
    type: DataTypes.INTEGER
  },
  process_id: {
    allowNull: false,
    type: DataTypes.INTEGER
  },
  brand_ids: {
    allowNull: false,
    type: DataTypes.ARRAY(DataTypes.INTEGER)
  },
  yarn_blend_id: {
    allowNull: false,
    type: DataTypes.INTEGER
  },
  cotton_mix_id: {
    allowNull: false,
    type: DataTypes.INTEGER
  },
  cotton_mix_qty: {
    allowNull: false,
    type: DataTypes.DOUBLE
  },
});
export default SpinSelectedBlend;
