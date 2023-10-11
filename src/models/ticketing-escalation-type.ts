import { DataTypes } from 'sequelize';
import db from '../util/dbConn';

const TicketEscalationTypes = db.define('ticketing_escalation_types', {
  id: {
    type: DataTypes.INTEGER,
    autoIncrement: true,
    allowNull: false,
    primaryKey: true
  },
  name: {
    type: DataTypes.STRING
  },
  processor_type: {
    type: DataTypes.ARRAY(DataTypes.STRING)
  },
  correction_type: {
    type: DataTypes.ARRAY(DataTypes.STRING)
  },
  status: {
    type: DataTypes.BOOLEAN,
    defaultValue: true
  },
  is_others: {
    type: DataTypes.BOOLEAN,
    defaultValue: false
  }
});

TicketEscalationTypes.sync();

export default TicketEscalationTypes;
