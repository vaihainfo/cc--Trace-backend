import { DataTypes  } from 'sequelize';
import db  from '../util/dbConn';

const Embroidering = db.define('embroiderings',{
  id: {
    type: DataTypes.INTEGER,
    autoIncrement: true,
    allowNull: false,
    primaryKey: true
  },
  processor_name: {
    allowNull: false,
    type: DataTypes.STRING
  },
  address: {
    allowNull: false,
    type: DataTypes.STRING
  },
  process_name: {
    allowNull: false,
    type: DataTypes.STRING
  },
  no_of_pieces: {
    type: DataTypes.DOUBLE
  },
  process_loss: {
    allowNull: false,
    type: DataTypes.INTEGER
  },
  final_no_of_pieces: {
    type: DataTypes.DOUBLE
  },
});

Embroidering.associate = (models: any) => {
  Embroidering.hasMany(models.GarmentProcess, {
    foreignKey: 'embroidering_id',
    as: 'embroidering',
  });
  Embroidering.hasMany(models.GarmentSales, {
    foreignKey: 'embroidering_id',
    as: 'embroidering',
  });
};

Embroidering.sync();

export default Embroidering;