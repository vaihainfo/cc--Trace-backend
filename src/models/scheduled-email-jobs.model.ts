import { DataTypes } from 'sequelize';
import db from '../util/dbConn';
import EmailManagement from './email-management.model';

const ScheduledEmailJobs = db.define('scheduled_email_jobs', {
  id: {
    allowNull: false,
    autoIncrement: true,
    primaryKey: true,
    type: DataTypes.INTEGER
  },
  email_job_id: {
    type: DataTypes.INTEGER
  },
  created_date: {
    type: DataTypes.DATE
  },
  scheduled_date: {
    type: DataTypes.DATE
  },
  no_of_attempts: {
    type: DataTypes.INTEGER
  },
  email_status: {
    type: DataTypes.BOOLEAN
  },
  email_message: {
    type: DataTypes.STRING
  },
});

ScheduledEmailJobs.belongsTo(EmailManagement, {
  foreignKey: "email_job_id",
  as: "emailjobs",
});

ScheduledEmailJobs.sync();

export default ScheduledEmailJobs;
