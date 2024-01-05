import { DataTypes } from 'sequelize';
import db from '../util/dbConn';
import UserRegistrations from './user-registrations.model';
import Program from './program.model';
import Ginner from './ginner.model';
import Spinner from './spinner.model';
import Garment from './garment.model';
import Weaver from './weaver.model';
import Knitter from './knitter.model';
import Country from './country.model';
import State from './state.model';
import Brand from './brand.model';

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
    type: DataTypes.ARRAY(DataTypes.INTEGER)
  },
  acs_block: {
    type: DataTypes.ARRAY(DataTypes.INTEGER)
  },
  acs_village: {
    type: DataTypes.ARRAY(DataTypes.INTEGER)
  },
  acs_ginner: {
    type: DataTypes.ARRAY(DataTypes.INTEGER)
  },
  acs_brand: {
    type: DataTypes.INTEGER
  },
  acs_all_village: {
    type: DataTypes.BOOLEAN
  },
  remember_me_token: {
    type: DataTypes.STRING
  },
});

UserApp.belongsTo(UserRegistrations, {
  foreignKey: "user_reg_id",
  as: "registrations",
})

UserApp.belongsTo(Program, {
  foreignKey: "program",
  as: "programs",
})

UserApp.belongsTo(Ginner, {
  foreignKey: "ginner_id",
  as: "ginner",
})

UserApp.belongsTo(Spinner, {
  foreignKey: "spinner_id",
  as: "spinner",
})

UserApp.belongsTo(Garment, {
  foreignKey: "garment_id",
  as: "garment",
})

UserApp.belongsTo(Weaver, {
  foreignKey: "weaver_id",
  as: "weaver",
});

UserApp.belongsTo(Knitter, {
  foreignKey: "knitter_id",
  as: "knitter",
});

UserApp.belongsTo(Country, {
  foreignKey: "acs_country_id",
  as: "acscountry",
});

UserApp.belongsTo(State, {
  foreignKey: "acs_state_id",
  as: "acsstate",
});

UserApp.belongsTo(Brand, {
  foreignKey: "acs_brand",
  as: "acsbrand",
});

UserApp.sync();

export default UserApp;