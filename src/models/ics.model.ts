import { DataTypes } from 'sequelize';
import db from '../util/dbConn';
import FarmGroup from './farm-group.model';

const ICS = db.define('ics', {
  id: {
    type: DataTypes.INTEGER,
    autoIncrement: true,
    allowNull: false,
    primaryKey: true
  },
  ics_name: {
    type: DataTypes.STRING,
    allowNull: false,
  },
  ics_latitude: {
    type: DataTypes.STRING,
  },
  ics_longitude: {
    type: DataTypes.STRING,
  },
  ics_status: {
    type: DataTypes.BOOLEAN,
    allowNull: false,
    defaultValue: true,
  },
});

ICS.belongsTo(FarmGroup, {
  foreignKey: "farmGroup_id",
  as: "farmGroup",
})

ICS.associate = (models: any) => {
  ICS.hasMany(models.ScopeCert, {
    foreignKey: 'ics_id',
    as: 'ics',
  });

  ICS.hasMany(models.OrganicIntegrity, {
    foreignKey: 'ics_id',
    as: 'ics',
  });
};

export default ICS;