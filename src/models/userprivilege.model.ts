import { DataTypes  } from 'sequelize';
import db  from '../util/dbConn';

import UserRole from './user-role.model';
import MenuList from './menu-list.model';

const UserPrivilege = db.define('user_privileges',{
  id: {
    type: DataTypes.INTEGER,
    autoIncrement: true,
    allowNull: false,
    primaryKey: true
  },
  userRole_id: {
    type: DataTypes.INTEGER,
    foreignKey: true,
    references: { model: 'user_roles', key: 'id' },
    onDelete: 'CASCADE',
    allowNull: false,
  },
  menu_id: {
    type: DataTypes.INTEGER,
    foreignKey: true,
    references: { model: 'menu_lists', key: 'id' },
    onDelete: 'CASCADE',
    allowNull: false,
  },
  create_privilege: {
    allowNull: false,
    type: DataTypes.BOOLEAN
  },
  edit_privilege: {
    allowNull: false,
    type: DataTypes.BOOLEAN
  },
  view_privilege: {
    allowNull: false,
    type: DataTypes.BOOLEAN
  },
  delete_privilege: {
    allowNull: false,
    type: DataTypes.BOOLEAN
  },
  status: {
    type: DataTypes.BOOLEAN
  },
});

UserPrivilege.belongsTo(UserRole, {
  foreignKey: "userRole_id",
  as: "userRole",
});

UserPrivilege.belongsTo(MenuList, {
  foreignKey: "menu_id",
  as: "menu",
});

UserPrivilege.sync();

export default UserPrivilege;