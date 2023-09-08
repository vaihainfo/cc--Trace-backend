import { DataTypes } from 'sequelize';
import db from '../util/dbConn';

const EmailTemplate = db.define('email_templates', {
  id: {
    type: DataTypes.INTEGER,
    autoIncrement: true,
    allowNull: false,
    primaryKey: true
  },
  template_name: {
    allowNull: false,
    type: DataTypes.STRING
  },
  file_name: {
    type: DataTypes.STRING
  },
  mail_type: {
    type: DataTypes.ARRAY(DataTypes.STRING)
  }
});

EmailTemplate.associate = (models: any) => {
  EmailTemplate.hasOne(models.EmailManagement, {
    foreignKey: 'template_id',
    as: 'template',
  });
};

EmailTemplate.sync();

export default EmailTemplate;