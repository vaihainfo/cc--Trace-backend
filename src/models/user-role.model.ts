import { DataTypes  } from 'sequelize';
import db  from '../util/dbConn';

import UserCategory from './user-category.model'
import User from './user.model';

const UserRole = db.define('user_roles',{
  id: {
    type: DataTypes.INTEGER,
    autoIncrement: true,
    allowNull: false,
    primaryKey: true
  },
  userCategory_id: {
    type: DataTypes.INTEGER,
    foreignKey: true,
    references: { model: 'user_categories', key: 'id' },
    onDelete: 'CASCADE',
    allowNull: false,
  },
  user_role: {
    allowNull: false,
    type: DataTypes.STRING
  },
});

UserRole.associate = (models: any) => {
  UserRole.hasMany(models.UserPrivilege, {
    foreignKey: 'userRole_id',
    as: 'user_role',
  });

  UserRole.hasMany(models.User, {
    foreignKey: 'role',
    as: 'user_role',
  });
};

UserRole.belongsTo(UserCategory, {
  foreignKey: "userCategory_id",
  as: "userCategory",
});

UserRole.sync();

export default UserRole;