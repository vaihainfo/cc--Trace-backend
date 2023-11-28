import { DataTypes } from 'sequelize';
import db from '../util/dbConn';

import Country from './country.model';
import State from './state.model';
import District from './district.model';

const Knitter = db.define('knitters', {
  id: {
    type: DataTypes.INTEGER,
    autoIncrement: true,
    allowNull: false,
    primaryKey: true
  },
  name: {
    allowNull: false,
    type: DataTypes.STRING
  },
  short_name: {
    type: DataTypes.STRING
  },
  address: {
    allowNull: false,
    type: DataTypes.STRING
  },
  country_id: {
    type: DataTypes.INTEGER,
    foreignKey: true,
    references: { model: 'countries', key: 'id' },
    onDelete: 'CASCADE',
    allowNull: false,
  },
  state_id: {
    type: DataTypes.INTEGER,
    foreignKey: true,
    references: { model: 'states', key: 'id' },
    onDelete: 'CASCADE',
    allowNull: false,
  },
  district_id: {
    type: DataTypes.INTEGER
  },
  program_id: {
    allowNull: false,
    type: DataTypes.ARRAY(DataTypes.INTEGER)
  },
  latitude: {
    type: DataTypes.STRING
  },
  longitude: {
    type: DataTypes.STRING
  },
  website: {
    type: DataTypes.STRING
  },
  contact_person: {
    allowNull: false,
    type: DataTypes.STRING
  },
  no_of_machines: {
    type: DataTypes.STRING
  },
  fabric_type: {
    type: DataTypes.ARRAY(DataTypes.INTEGER)
  },
  prod_cap: {
    type: DataTypes.ARRAY(DataTypes.INTEGER)
  },
  loss_from: {
    type: DataTypes.STRING
  },
  loss_to: {
    type: DataTypes.STRING
  },
  unit_cert: {
    type: DataTypes.ARRAY(DataTypes.INTEGER)
  },
  company_info: {
    type: DataTypes.STRING
  },
  org_logo: {
    type: DataTypes.STRING
  },
  org_photo: {
    type: DataTypes.STRING
  },
  certs: {
    type: DataTypes.STRING
  },
  brand: {
    allowNull: false,
    type: DataTypes.ARRAY(DataTypes.INTEGER)
  },
  mobile: {
    type: DataTypes.STRING
  },
  landline: {
    type: DataTypes.STRING
  },
  email: {
    type: DataTypes.STRING
  },
  knitterUser_id: {
    allowNull: false,
    type: DataTypes.ARRAY(DataTypes.INTEGER)
  },
  registration_document: {
    type: DataTypes.STRING
  }
});

Knitter.belongsTo(Country, {
  foreignKey: "country_id",
  as: "country",
});

Knitter.belongsTo(State, {
  foreignKey: "state_id",
  as: "state",
});

Knitter.belongsTo(District, {
  foreignKey: "district_id",
  as: "district",
});
Knitter.associate = (models: any) => {
  Knitter.hasMany(models.KnitProcess, {
    foreignKey: 'knitter_id',
    as: 'knitter',
  });

  Knitter.hasMany(models.KnitSales, {
    foreignKey: 'knitter_id',
    as: 'knitter',
  });
};

Knitter.sync();

export default Knitter;