import { DataTypes } from 'sequelize';
import db from '../util/dbConn';
import SpinProcess from './spin-process.model';
import Spinner from './spinner.model';

const CombernoilGeneration = db.define('combernoil_generations', {
  id: {
    allowNull: false,
    autoIncrement: true,
    primaryKey: true,
    type: DataTypes.INTEGER
  },
  spinner_id: {
    type: DataTypes.INTEGER,
    allowNull: false
  },
  process_id: {
    type: DataTypes.INTEGER,
    allowNull: true,
    comment: 'ID from process if yarn type is combed and combernoil generated during process'
  },
  sales_id: {
    type: DataTypes.INTEGER,
    allowNull: true,
    comment: 'ID from spin_combernoil_sale if purchased from other spinner'
  },
  old_combernoil_id: {
    type: DataTypes.INTEGER,
    allowNull: true,
    comment: 'ID from combernoil_generation if used from other spinner'
  },
  total_qty: {
    type: DataTypes.DOUBLE,
    allowNull: false,
    comment: 'Total combernoil quantity'
  },
  qty_stock: {
    type: DataTypes.DOUBLE,
    allowNull: false,
    comment: 'Available stock after combernoil used'
  },
  created_date: {
    type: DataTypes.DATE,
    defaultValue: DataTypes.NOW
  },
  updated_date: {
    type: DataTypes.DATE,
    defaultValue: DataTypes.NOW
  }
}, {
  timestamps: false
});

CombernoilGeneration.belongsTo(SpinProcess, {
  foreignKey: 'process_id',
  targetKey: 'id',
  as: 'spinProcess'
}); 

CombernoilGeneration.belongsTo(Spinner, {
  foreignKey: 'spinner_id',
  targetKey: 'id',
  as: 'spinner'
});


CombernoilGeneration.sync();


export default CombernoilGeneration;