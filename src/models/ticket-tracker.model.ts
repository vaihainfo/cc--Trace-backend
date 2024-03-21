import { DataTypes } from 'sequelize';
import db from '../util/dbConn';

const TicketTracker = db.define('ticket_trackers', {
  id: {
    type: DataTypes.INTEGER,
    autoIncrement: true,
    allowNull: false,
    primaryKey: true
  },
  ticket_no: {
    type: DataTypes.BIGINT
  },
  date: {
    allowNull: false,
    type: DataTypes.DATE
  },
  process_id: {
    type: DataTypes.INTEGER
  },
  processor_name: {
    type: DataTypes.STRING
  },
  processor_type: {
    type: DataTypes.STRING
  },
  ticket_type: {
    type: DataTypes.STRING
  },
  process_or_sales: {
    type: DataTypes.STRING
  },
  style_mark_no: {
    type: DataTypes.STRING
  },
  comments: {
    type: DataTypes.TEXT
  },
  documents: {
    type: DataTypes.STRING
  },
  status: {
    type: DataTypes.STRING
  },
  resolved_date: {
    type: DataTypes.DATE
  },
});

TicketTracker.sync();

export default TicketTracker;

