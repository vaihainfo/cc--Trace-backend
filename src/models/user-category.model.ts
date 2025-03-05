import { DataTypes  } from 'sequelize';
import db  from '../util/dbConn';

const UserCategory = db.define('user_categories',{
  id: {
    type: DataTypes.INTEGER,
    autoIncrement: true,
    allowNull: false,
    primaryKey: true
  },
  category_name: {
    type: DataTypes.STRING,
    allowNull: false,
  },
});

UserCategory.associate = (models: any) => {
  UserCategory.hasMany(models.UserRole, {
    foreignKey: 'userCategory_id',
    as: 'userCategory',
  });
};
UserCategory.sync();

export default UserCategory;