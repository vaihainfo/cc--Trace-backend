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
import TraceabilityExecutive from './traceability-executive.model';
import SupplyChainManager from './supply-chain-manager.model';
import SupplyChainDirector from './supply-chain-director.model';

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
  lsv_country: {
    type: DataTypes.INTEGER,
  },
    lsv_brand: {
      type: DataTypes.ARRAY(DataTypes.INTEGER),
    },
    lsv_mapped_states: {
      type: DataTypes.ARRAY(DataTypes.INTEGER),
    },
    lsv_mapped_ginners: {
      type: DataTypes.ARRAY(DataTypes.INTEGER),
    },
    lsv_mapped_spinners: {
      type: DataTypes.ARRAY(DataTypes.INTEGER),
    },
    lsv_mapped_to: {
      type: DataTypes.STRING,
    },
    te_id: {
      type: DataTypes.INTEGER
    },
    scm_id: {
      type: DataTypes.INTEGER
    },
    scd_id: {
      type: DataTypes.INTEGER
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

UserApp.belongsTo(TraceabilityExecutive, {
  foreignKey: "te_id",
  as: "traceability_executive",
})

UserApp.belongsTo(SupplyChainManager, {
  foreignKey: "scm_id",
  as: "supply_chain_manager",
});

UserApp.belongsTo(SupplyChainDirector, {
  foreignKey: "scd_id",
  as: "supply_chain_director",
});

UserApp.sync();

export default UserApp;