import { DataTypes } from 'sequelize';
import db from '../util/dbConn';
import Program from './program.model';

const OldPrintingSales = db.define('old_printing_sales', {
    id: {
        type: DataTypes.INTEGER,
        autoIncrement: true,
        primaryKey: true
    },
    season_id: {
        type: DataTypes.INTEGER
    },
    printing_id: {
        type: DataTypes.INTEGER
    },
    date: {
        type: DataTypes.DATE
    },
    program: {
        type: DataTypes.INTEGER
    },
    order_refernce: {
        type: DataTypes.STRING
    },
    buyer_type: {
        type: DataTypes.STRING
    },
    buyer_id: {
        type: DataTypes.INTEGER
    },
    processor_name: {
        type: DataTypes.STRING
    },
    processor_address: {
        type: DataTypes.TEXT
    },
    fabric_quantity: {
        type: DataTypes.DOUBLE
    },
    old_fabric_quantity: {
        type: DataTypes.DOUBLE
    },
    add_fabric_quantity: {
        type: DataTypes.DOUBLE
    },
    total_fabric_quantity: {
        type: DataTypes.DOUBLE
    },
    fabric_type: {
        type: DataTypes.STRING,
        defaultValue: null
    },
    fabric_length: {
        type: DataTypes.DOUBLE
    },
    gsm: {
        type: DataTypes.STRING
    },
    fabric_net_weight: {
        type: DataTypes.DOUBLE
    },
    batch_lot_no: {
        type: DataTypes.STRING
    },
    job_details: {
        type: DataTypes.STRING
    },
    print_type: {
        type: DataTypes.STRING
    },
    invoice_no: {
        type: DataTypes.STRING
    },
    upload_patter_from_garment: {
        type: DataTypes.STRING
    },
    order_details: {
        type: DataTypes.STRING
    },
    bill_of_lading: {
        type: DataTypes.STRING
    },
    transport_information: {
        type: DataTypes.STRING
    },
    qty_stock: {
        type: DataTypes.DOUBLE
    },
    status: {
        type: DataTypes.INTEGER
    },
    printing_details: {
        type: DataTypes.STRING,
        defaultValue: null
    },
    printing_pattern: {
        type: DataTypes.STRING,
        defaultValue: null
    },
    weight_gain: {
        type: DataTypes.STRING
    },
    weight_loss: {
        type: DataTypes.STRING
    },
    accept_date: {
        type: DataTypes.DATE
    },
    created_date: {
        type: DataTypes.DATE,
        defaultValue: new Date()
    }
}, {
    timestamps: false
});

OldPrintingSales.belongsTo(Program, {
    foreignKey: "program",
    as: "program_data"
});

OldPrintingSales.sync();
export default OldPrintingSales;