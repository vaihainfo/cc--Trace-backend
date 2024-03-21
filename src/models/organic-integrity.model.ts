import { DataTypes } from 'sequelize';
import db from '../util/dbConn';

import Brand from './brand.model';
import FarmGroup from './farm-group.model';
import ICS from './ics.model'
import Ginner from './ginner.model';
import Farmer from './farmer.model';

const OrganicIntegrity = db.define('organic_integrities', {
  id: {
    type: DataTypes.INTEGER,
    autoIncrement: true,
    allowNull: false,
    primaryKey: true
  },
  date: {
    allowNull: false,
    type: DataTypes.DATE
  },
  brand_id: {
    type: DataTypes.INTEGER,
    foreignKey: true,
    references: { model: 'brands', key: 'id' },
    onDelete: 'CASCADE',
    allowNull: false,
  },
  farmGroup_id: {
    type: DataTypes.INTEGER
  },
  ics_id: {
    type: DataTypes.INTEGER,
  },
  ginner_id: {
    type: DataTypes.INTEGER
  },
  test_stage: {
    allowNull: false,
    type: DataTypes.STRING
  },
  farmer: {
    type: DataTypes.INTEGER
  },
  seal_no: {
    type: DataTypes.STRING
  },
  sample_code: {
    type: DataTypes.STRING
  },
  seed_lot: {
    type: DataTypes.STRING
  },
  integrity_score: {
    allowNull: false,
    type: DataTypes.BOOLEAN
  },
  documents: {
    allowNull: false,
    type: DataTypes.STRING
  },
});

OrganicIntegrity.belongsTo(Brand, {
  foreignKey: "brand_id",
  as: "brand",
});

OrganicIntegrity.belongsTo(Ginner, {
  foreignKey: "ginner_id",
  as: "ginner",
});

OrganicIntegrity.belongsTo(Farmer, {
  foreignKey: "farmer",
  as: "farmerdetails",
});

OrganicIntegrity.belongsTo(FarmGroup, {
  foreignKey: "farmGroup_id",
  as: "farmGroup",
});

OrganicIntegrity.belongsTo(ICS, {
  foreignKey: "ics_id",
  as: "ics",
});



OrganicIntegrity.sync();

export default OrganicIntegrity;