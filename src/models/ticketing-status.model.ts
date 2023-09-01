import { DataTypes } from 'sequelize';
import db from '../util/dbConn';

const TicketTrackerStatus = db.define('ticket_tracker_status', {
    id: {
        type: DataTypes.INTEGER,
        autoIncrement: true,
        allowNull: false,
        primaryKey: true
    },
    ticket_id: {
        type: DataTypes.INTEGER
    },
    status: {
        type: DataTypes.STRING
    },
    comment: {
        type: DataTypes.STRING
    },
    user_id: {
        type: DataTypes.INTEGER
    }
});

TicketTrackerStatus.sync();

export default TicketTrackerStatus;