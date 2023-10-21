import { DataTypes } from 'sequelize';
import db from '../util/dbConn';
import Country from './country.model';
import State from './state.model';
import District from './district.model';

const Fabric = db.define('fabrics', {
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
  address: {
    allowNull: false,
    type: DataTypes.TEXT
  },
  country_id: {
    allowNull: false,
    type: DataTypes.INTEGER
  },
  state_id: {
    allowNull: false,
    type: DataTypes.INTEGER
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
  longtude: {
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
  fabric_processor_type: {
    type: DataTypes.ARRAY(DataTypes.STRING)
  },
  prod_capt: {
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
  fabricUser_id: {
    allowNull: false,
    type: DataTypes.ARRAY(DataTypes.INTEGER)
  },
  registration_document: {
    type: DataTypes.STRING
  },
  short_name: {
    type: DataTypes.STRING
  },
});

Fabric.belongsTo(Country, {
  foreignKey: "country_id",
  as: "country",
});

Fabric.belongsTo(State, {
  foreignKey: "state_id",
  as: "state",
});
Fabric.belongsTo(District, {
  foreignKey: "district_id",
  as: "district",
});


Fabric.associate = (models: any) => {
  Fabric.hasMany(models.FabricDyeingProcess, {
    foreignKey: 'fabric_id',
    as: 'fabric',
  });

  Fabric.hasMany(models.FabricCompactingProcess, {
    foreignKey: 'fabric_id',
    as: 'fabric',
  });

  Fabric.hasMany(models.FabricWashingProcess, {
    foreignKey: 'fabric_id',
    as: 'fabric',
  });

  Fabric.hasMany(models.FabricPrintingProcess, {
    foreignKey: 'fabric_id',
    as: 'fabric',
  });
};

Fabric.sync();

export default Fabric;