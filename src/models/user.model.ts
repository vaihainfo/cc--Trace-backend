import { DataTypes } from 'sequelize';
import db from '../util/dbConn';
import UserRole from './user-role.model';

const User = db.define('users', {
  id: {
    type: DataTypes.INTEGER,
    autoIncrement: true,
    allowNull: false,
    primaryKey: true
  },
  username: {
    type: DataTypes.STRING,
    allowNull: false,
    unique: true,
  },
  email: {
    type: DataTypes.STRING,
    allowNull: false,
    unique: true
  },
  firstname: {
    type: DataTypes.STRING,
    allowNull: false, // Or false, depending on your requirements
  },
  lastname: {
    type: DataTypes.STRING,
    allowNull: false, // Or false, depending on your requirements
  },
  password: {
    type: DataTypes.STRING,
    allowNull: false
  },
  farm_group: {
    type: DataTypes.ARRAY(DataTypes.INTEGER),
  },
  role: {
    type: DataTypes.INTEGER,
  },
  position: {
    type: DataTypes.STRING
  },
  mobile: {
    allowNull: false,
    type: DataTypes.STRING
  },
  countries_web: {
    type: DataTypes.ARRAY(DataTypes.INTEGER),
  },
  access_level: {
    type: DataTypes.ARRAY(DataTypes.STRING),
  },
  country_id: {
    type: DataTypes.INTEGER,
  },
  state_id: {
    type: DataTypes.INTEGER,
  },
  district_id: {
    type: DataTypes.ARRAY(DataTypes.INTEGER),
  },
  block_id: {
    type: DataTypes.ARRAY(DataTypes.INTEGER),
  },
  village_id: {
    type: DataTypes.ARRAY(DataTypes.INTEGER),
  },
  brand_mapped: {
    type: DataTypes.ARRAY(DataTypes.INTEGER),
  },
  ticketApproveAccess: {
    type: DataTypes.BOOLEAN
  },
  ticketCountryAccess: {
    type: DataTypes.ARRAY(DataTypes.STRING)
  },
  ticketAccessOnly: {
    type: DataTypes.BOOLEAN
  },
  isManagementUser: {
    type: DataTypes.BOOLEAN,
    allowNull: false,
    defaultValue: false,
  },
  isAgreementAgreed: {
    type: DataTypes.BOOLEAN,
    allowNull: false,
    defaultValue: false,
  },
  status: {
    allowNull: false,
    defaultValue: true,
    type: DataTypes.BOOLEAN
  },
  process_role: {
    type: DataTypes.ARRAY(DataTypes.INTEGER),
  },
  otp: {
    type: DataTypes.STRING,
    allowNull: true,
},
  expiry: {
    type: DataTypes.DATE,
    allowNull: true,
},
is_otp_required: {
  type: DataTypes.BOOLEAN,
  defaultValue: false,
},
lsv_program: {
  type: DataTypes.INTEGER,
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
  is_lsv_user: {
    type: DataTypes.BOOLEAN,
    defaultValue: false,
  },
});

User.associate = (models: any) => {
  User.hasMany(models.Device, {
    foreignKey: 'user_id',
    as: 'user',
  });

};

User.belongsTo(UserRole, {
  foreignKey: "role",
  as: "user_role",
});

User.sync()

export default User;