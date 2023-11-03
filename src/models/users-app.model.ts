import { DataTypes } from 'sequelize';
import db from '../util/dbConn';
import UserRegistrations from './user-registrations.model';

const UserApp = db.define('users_apps', {
  id: {
    allowNull: false,
    autoIncrement: true,
    primaryKey: true,
    type: DataTypes.INTEGER
  },
  username: {
    type: DataTypes.STRING
  },
  password: {
    type: DataTypes.STRING
  },
  firstName: {
    type: DataTypes.STRING
  },
  lastName: {
    type: DataTypes.STRING
  },
  reset_token: {
    type: DataTypes.STRING
  },
  mobile_no: {
    type: DataTypes.STRING
  },
  access_level: {
    type: DataTypes.STRING
  },
  user_reg_id: {
    type: DataTypes.INTEGER
  },
  email: {
    type: DataTypes.STRING
  },
  agent_id: {
    type: DataTypes.INTEGER
  },
  ginner_id: {
    type: DataTypes.INTEGER
  },
  spinner_id: {
    type: DataTypes.INTEGER
  },
  garment_id: {
    type: DataTypes.INTEGER
  },
  weaver_id: {
    type: DataTypes.INTEGER
  },
  knitter_id: {
    type: DataTypes.INTEGER
  },
  country: {
    type: DataTypes.INTEGER
  },
  farmer_group: {
    type: DataTypes.STRING
  },
  program: {
    type: DataTypes.INTEGER
  },
  platform: {
    type: DataTypes.STRING
  },
  status: {
    type: DataTypes.BOOLEAN
  },
  acs_country_id: {
    type: DataTypes.INTEGER
  },
  acs_state_id: {
    type: DataTypes.INTEGER
  },
  acs_district: {
    type: DataTypes.STRING
  },
  acs_block: {
    type: DataTypes.STRING
  },
  acs_village: {
    type: DataTypes.STRING
  },
  acs_ginner: {
    type: DataTypes.STRING
  },
  acs_brand: {
    type: DataTypes.INTEGER
  },
  acs_all_village: {
    type: DataTypes.INTEGER
  },
  remember_me_token: {
    type: DataTypes.STRING
  },
});

UserApp.belongsTo(UserRegistrations, {
  foreignKey: "user_reg_id",
  as: "registrations",
})

UserApp.sync();

export default UserApp;