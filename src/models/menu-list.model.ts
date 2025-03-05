import { DataTypes  } from 'sequelize';
import db  from '../util/dbConn';

const MenuList = db.define('menu_lists',{
  id: {
    type: DataTypes.INTEGER,
    autoIncrement: true,
    allowNull: false,
    primaryKey: true
  },
  menu_name: {
    allowNull: false,
    type: DataTypes.STRING
  },
  categories_allowed: {
    allowNull: false,
    type: DataTypes.ARRAY(DataTypes.INTEGER)
  },
  status: {
    type: DataTypes.BOOLEAN
  },
});


MenuList.associate = (models: any) => {
  MenuList.hasMany(models.UserPrivilege, {
    foreignKey: 'menu_id',
    as: 'menu',
  });
};

MenuList.sync();

export default MenuList;