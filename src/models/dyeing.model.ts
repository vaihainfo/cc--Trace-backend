import { DataTypes  } from 'sequelize';
import db  from '../util/dbConn';

const Dyeing = db.define('dyeings',{
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
  dyeing_address: {
    allowNull: false,
    type: DataTypes.STRING
  },
  process_name: {
    allowNull: false,
    type: DataTypes.STRING
  },
  yarn_delivered: {
    type: DataTypes.DOUBLE
  },
  process_loss: {
    allowNull: false,
    type: DataTypes.DOUBLE
  },
  net_yarn: {
    type: DataTypes.DOUBLE
  },
});

Dyeing.associate = (models: any) => {
  Dyeing.hasMany(models.SpinProcess, {
    foreignKey: 'dyeing_id',
    as: 'dyeing',
  });

  Dyeing.hasMany(models.KnitSales, {
    foreignKey: 'dyeing_id',
    as: 'dyeing',
  });

  Dyeing.hasMany(models.WeaverSales, {
    foreignKey: 'dyeing_id',
    as: 'dyeing',
  });
};

Dyeing.sync();

export default Dyeing;