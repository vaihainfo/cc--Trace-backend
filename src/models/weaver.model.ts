import { DataTypes } from 'sequelize';
import db from '../util/dbConn';

import Country from './country.model';
import State from './state.model';
import District from './district.model';

const Weaver = db.define('weavers', {
  id: {
    type: DataTypes.INTEGER,
    autoIncrement: true,
    allowNull: false,
    primaryKey: true
  },
  sequence_no: {
    type: DataTypes.INTEGER,
    allowNull: false,
    defaultValue: db.literal("nextval('weaver_seq')"),
    unique: true
  },
  name: {
    allowNull: false,
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
  short_name: {
    type: DataTypes.STRING
  },
  loom_type: {
    type: DataTypes.STRING
  },
  weaverUser_id: {
    allowNull: false,
    type: DataTypes.ARRAY(DataTypes.INTEGER)
  },
  registration_document: {
    type: DataTypes.STRING
  },
  status: {
    allowNull: false,
    defaultValue: true,
    type: DataTypes.BOOLEAN
  },
});

Weaver.belongsTo(Country, {
  foreignKey: "country_id",
  as: "country",
});

Weaver.belongsTo(State, {
  foreignKey: "state_id",
  as: "state",
});

Weaver.belongsTo(District, {
  foreignKey: "district_id",
  as: "district",
});

Weaver.associate = (models: any) => {
  Weaver.hasMany(models.WeaverProcess, {
    foreignKey: 'weaver_id',
    as: 'weaver',
  });

  Weaver.hasMany(models.WeaverSales, {
    foreignKey: 'weaver_id',
    as: 'weaver',
  });
};

Weaver.sync();

export default Weaver;