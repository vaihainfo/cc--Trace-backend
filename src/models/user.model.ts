import { DataTypes  } from 'sequelize';
import db  from '../util/dbConn';
import UserRole from './user-role.model';

const User = db.define('users',{
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
    type: DataTypes.STRING,
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