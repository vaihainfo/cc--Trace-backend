import { DataTypes  } from 'sequelize';
import db  from '../util/dbConn';
import EmailTemplate from './email-template.model';

const EmailManagement = db.define('email_managements',{
  id: {
    type: DataTypes.INTEGER,
    autoIncrement: true,
    allowNull: false,
    primaryKey: true
  },
  template_id: {
    type: DataTypes.INTEGER,
    references: { model: 'email_templates', key: 'id' },
    onDelete: 'CASCADE',
    allowNull: false,
    foreignKey: true,
  },
  mail_type: {
    allowNull: false,
    type: DataTypes.STRING
  },
  user_categories: {
    allowNull: false,
    type: DataTypes.ARRAY(DataTypes.INTEGER)
  },
  program_ids: {
    allowNull: false,
    type: DataTypes.ARRAY(DataTypes.INTEGER)
  },
  brand_ids: {
    allowNull: false,
    type: DataTypes.ARRAY(DataTypes.INTEGER)
  },
  country_ids: {
    allowNull: false,
    type: DataTypes.ARRAY(DataTypes.INTEGER)
  },
  user_ids: {
    allowNull: false,
    type: DataTypes.ARRAY(DataTypes.INTEGER)
  },
});

EmailManagement.belongsTo(EmailTemplate, {
  foreignKey: "template_id",
  as: "template",
});

EmailManagement.sync();

export default EmailManagement;