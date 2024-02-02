import { DataTypes } from 'sequelize';
import db from '../util/dbConn';
import Program from './program.model';

const OldWashingSales = db.define('old_washing_sales', {
    id: {
        type: DataTypes.INTEGER,
        autoIncrement: true,
        allowNull: false,
        primaryKey: true
    },
    season_id: {
        type: DataTypes.INTEGER,
        allowNull: false
    },
    washing_id: {
        type: DataTypes.INTEGER,
        allowNull: false
    },
    date: {
        type: DataTypes.DATE,
        allowNull: false
    },
    program: {
        type: DataTypes.INTEGER,
        allowNull: false
    },
    order_refernce: {
        type: DataTypes.STRING,
        allowNull: false
    },
    buyer_type: {
        type: DataTypes.STRING,
        allowNull: false
    },
    buyer_id: {
        type: DataTypes.INTEGER,
        allowNull: false
    },
    processor_name: {
        type: DataTypes.STRING,
        allowNull: false
    },
    processor_address: {
        type: DataTypes.TEXT,
        allowNull: false
    },
    fabric_quantity: {
        type: DataTypes.DOUBLE,
        allowNull: false
    },
    old_fabric_quantity: {
        type: DataTypes.DOUBLE,
        allowNull: false
    },
    add_fabric_quantity: {
        type: DataTypes.DOUBLE,
        allowNull: false
    },
    total_fabric_quantity: {
        type: DataTypes.DOUBLE,
        allowNull: false
    },
    fabric_type: {
        type: DataTypes.STRING,
        defaultValue: null
    },
    fabric_length: {
        type: DataTypes.DOUBLE,
        allowNull: false
    },
    gsm: {
        type: DataTypes.STRING,
        allowNull: false
    },
    fabric_net_weight: {
        type: DataTypes.DOUBLE,
        allowNull: false
    },
    batch_lot_no: {
        type: DataTypes.STRING,
        allowNull: false
    },
    job_details: {
        type: DataTypes.STRING,
        allowNull: false
    },
    wash_type: {
        type: DataTypes.STRING,
        allowNull: false
    },
    invoice_no: {
        type: DataTypes.STRING,
        allowNull: false
    },
    order_details: {
        type: DataTypes.STRING,
        allowNull: false
    },
    bill_of_lading: {
        type: DataTypes.STRING,
        allowNull: false
    },
    transport_information: {
        type: DataTypes.STRING,
        allowNull: false
    },
    qty_stock: {
        type: DataTypes.DOUBLE,
        allowNull: false
    },
    status: {
        type: DataTypes.INTEGER,
        allowNull: false
    },
    washing_details: {
        type: DataTypes.STRING,
        defaultValue: null
    },
    weight_gain: {
        type: DataTypes.STRING,
        allowNull: false
    },
    weight_loss: {
        type: DataTypes.STRING,
        allowNull: false
    },
    accept_date: {
        type: DataTypes.DATE,
        allowNull: false
    },
    created_date: {
        type: DataTypes.DATE,
        allowNull: false,
        defaultValue: new Date()
    }
}, {
    timestamps: false
});

OldWashingSales.belongsTo(Program, {
    foreignKey: "program",
    as: "program_data"
});

OldWashingSales.sync();
export default OldWashingSales;