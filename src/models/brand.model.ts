import { DataTypes } from 'sequelize';
import db from '../util/dbConn';

const Brand = db.define('brands', {
  id: {
    type: DataTypes.INTEGER,
    autoIncrement: true,
    allowNull: false,
    primaryKey: true
  },
  brand_name: {
    allowNull: false,
    type: DataTypes.STRING
  },
  address: {
    allowNull: false,
    type: DataTypes.STRING
  },
  email: {
    type: DataTypes.STRING
  },
  programs_id: {
    allowNull: false,
    type: DataTypes.ARRAY(DataTypes.INTEGER)
  },
  countries_id: {
    allowNull: false,
    type: DataTypes.ARRAY(DataTypes.INTEGER)
  },
  website: {
    type: DataTypes.STRING
  },
  company_info: {
    type: DataTypes.STRING
  },
  contact_person: {
    allowNull: false,
    type: DataTypes.STRING
  },
  logo: {
    type: DataTypes.STRING
  },
  photo: {
    type: DataTypes.STRING
  },
  mobile: {
    type: DataTypes.STRING
  },
  landline: {
    type: DataTypes.STRING
  },
  brandUser_id: {
    allowNull: false,
    type: DataTypes.ARRAY(DataTypes.INTEGER)
  },
  entity_limit: {
    type: DataTypes.DOUBLE,
    defaultValue: 0
  }
});

Brand.associate = (models: any) => {
  Brand.hasMany(models.Farmer, {
    foreignKey: 'brand_id',
    as: 'brand',
  });

  Brand.hasMany(models.EntityLimit, {
    foreignKey: 'brand_id',
    as: 'brand',
  });

  Brand.hasMany(models.Transaction, {
    foreignKey: 'brand_id',
    as: 'brand',
  });

  Brand.hasMany(models.ScopeCert, {
    foreignKey: 'brand_id',
    as: 'brand',
  });

  Brand.hasMany(models.OrganicIntegrity, {
    foreignKey: 'brand_id',
    as: 'brand',
  });

  Brand.hasMany(models.ProcessorTraining, {
    foreignKey: 'brand_id',
    as: 'brand',
  });
};

Brand.sync();

export default Brand;