import { DataTypes } from 'sequelize';
import db from '../util/dbConn';
import Farmer from './farmer.model';
import ICS from './ics.model';
import Season from './season.model';
import FarmGroup from './farm-group.model';
import Brand from './brand.model';

const ValidationFarmer = db.define('validation_farmers', {
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
  season_id: {
    allowNull: false,
    type: DataTypes.INTEGER
  },
  brand_id: {
    allowNull: false,
    type: DataTypes.INTEGER
  },
  farmGroup_id: {
    allowNull: false,
    type: DataTypes.INTEGER
  },
  ics_id: {
    allowNull: false,
    type: DataTypes.INTEGER
  },
  farmer_id: {
    allowNull: false,
    type: DataTypes.INTEGER
  },
  farmer_image: {
    allowNull: false,
    type: DataTypes.STRING
  },
  valid_identity: {
    allowNull: false,
    type: DataTypes.STRING
  },
  identity_others: {
    type: DataTypes.STRING
  },
  identity_id: {
    allowNull: false,
    type: DataTypes.STRING
  },
  identity_image: {
    type: DataTypes.STRING
  },
  cotton_purchaser: {
    allowNull: false,
    type: DataTypes.STRING
  },
  market_rate: {
    allowNull: false,
    type: DataTypes.STRING
  },
  payment_mode: {
    allowNull: false,
    type: DataTypes.STRING
  },
  payment_proof: {
    allowNull: false,
    type: DataTypes.BOOLEAN
  },
  proof_name: {
    type: DataTypes.STRING
  },
  proof_document: {
    type: DataTypes.STRING
  },
  is_ginner_supported: {
    allowNull: false,
    type: DataTypes.BOOLEAN
  },
  ginner_supported_details: {
    type: DataTypes.ARRAY(DataTypes.STRING)
  },
  ginner_supported_others: {
    type: DataTypes.ARRAY(DataTypes.STRING)
  },
  support_mode: {
    allowNull: false,
    type: DataTypes.ARRAY(DataTypes.STRING)
  },
  verifier_inference: {
    allowNull: false,
    type: DataTypes.STRING
  },
  partially_verified: {
    type: DataTypes.TEXT
  },
});

ValidationFarmer.belongsTo(Farmer, {
  foreignKey: "farmer_id",
  as: "farmer",
})

ValidationFarmer.belongsTo(ICS, {
  foreignKey: "ics_id",
  as: "ics",
})

ValidationFarmer.belongsTo(Brand, {
  foreignKey: "brand_id",
  as: "brand",
})

ValidationFarmer.belongsTo(Season, {
  foreignKey: "season_id",
  as: "season",
})

ValidationFarmer.belongsTo(FarmGroup, {
  foreignKey: "farmGroup_id",
  as: "farmGroup",
})



ValidationFarmer.sync();

export default ValidationFarmer;