import { DataTypes } from 'sequelize';
import db from '../util/dbConn';
import Season from './season.model';
import FabricType from './fabric-type.model';
import Program from './program.model';

const OldKnitterSales = db.define('old_knitter_sales', {
    id: {
        type: DataTypes.INTEGER,
        autoIncrement: true,
        allowNull: false,
        primaryKey: true
    },
    knitter_id: {
        type: DataTypes.INTEGER,
        allowNull: false,
    },
    date: {
        type: DataTypes.DATE,
        allowNull: false,
    },
    order_refernce: {
        type: DataTypes.STRING,
        allowNull: false,
    },
    program: {
        type: DataTypes.INTEGER,
        allowNull: false,
    },
    buyer_type: {
        type: DataTypes.STRING,
        allowNull: false,
    },
    garment_id: {
        type: DataTypes.INTEGER,
        allowNull: false,
    },
    garment_name: {
        type: DataTypes.STRING,
        allowNull: false,
    },
    garment_address: {
        type: DataTypes.TEXT,
        allowNull: false,
    },
    yarn_qty: {
        type: DataTypes.DOUBLE,
        allowNull: false,
    },
    add_yarn_qty: {
        type: DataTypes.DOUBLE,
        allowNull: false,
    },
    total_yarn_qty: {
        type: DataTypes.DOUBLE,
        allowNull: false,
    },
    fabric_type: {
        type: DataTypes.INTEGER,
        allowNull: false,
    },
    fabric_length: {
        type: DataTypes.DOUBLE,
        allowNull: false,
    },
    gsm: {
        type: DataTypes.STRING,
        allowNull: false,
    },
    fabric_net_weight: {
        type: DataTypes.DOUBLE,
        allowNull: false,
    },
    batch_lot_no: {
        type: DataTypes.STRING,
        allowNull: false,
    },
    bale_ids: {
        type: DataTypes.STRING,
        allowNull: false,
    },
    invoice_no: {
        type: DataTypes.STRING,
        allowNull: false,
    },
    no_of_bales: {
        type: DataTypes.STRING,
        allowNull: false,
    },
    bill_of_lading: {
        type: DataTypes.STRING,
        allowNull: false,
    },
    transport_info: {
        type: DataTypes.STRING,
        allowNull: false,
    },
    transporter_name: {
        type: DataTypes.STRING,
        allowNull: false,
    },
    vehicle_no: {
        type: DataTypes.STRING,
        allowNull: false,
    },
    quality_doc: {
        type: DataTypes.STRING,
        allowNull: false,
    },
    tc_files: {
        type: DataTypes.STRING,
        allowNull: false,
    },
    contract_files: {
        type: DataTypes.STRING,
        allowNull: false,
    },
    invoice_files: {
        type: DataTypes.STRING,
        allowNull: false,
    },
    delivery_notes: {
        type: DataTypes.STRING,
        allowNull: false,
    },
    dyeing_process: {
        type: DataTypes.STRING,
        allowNull: false,
    },
    dyeing_processor_name: {
        type: DataTypes.STRING,
        allowNull: false,
    },
    dyeing_address: {
        type: DataTypes.STRING,
        allowNull: false,
    },
    dyeing_process_name: {
        type: DataTypes.STRING,
        allowNull: false,
    },
    dyeing_process_loss: {
        type: DataTypes.DOUBLE,
        allowNull: false,
    },
    dyeing_net_weight: {
        type: DataTypes.DOUBLE,
        allowNull: false,
    },
    qty_stock: {
        type: DataTypes.DOUBLE,
        allowNull: false,
    },
    status: {
        type: DataTypes.INTEGER,
        allowNull: false,
    },
    accept_date: {
        type: DataTypes.DATE,
        allowNull: false,
    },
    season_id: {
        type: DataTypes.BIGINT,
        defaultValue: null,
    },
    cottonmix_type: {
        type: DataTypes.STRING,
        defaultValue: null,
    },
    cottonmix_qty: {
        type: DataTypes.STRING,
        defaultValue: null,
    },
    transaction_via_trader: {
        type: DataTypes.INTEGER,
        allowNull: false,
    },
    transcation_details: {
        type: DataTypes.TEXT
    },
    created_date: {
        type: DataTypes.DATE,
        allowNull: false,
        defaultValue: new Date()
    },
    submitted_by: {
        type: DataTypes.BIGINT,
        defaultValue: null
    },
    accept_by: {
        type: DataTypes.BIGINT,
        defaultValue: null
    },
    physical_traceability_process: {
        type: DataTypes.SMALLINT,
        allowNull: false,
        defaultValue: "0"
    },
}, {
    timestamps: false
});

OldKnitterSales.belongsTo(Season, {
    foreignKey: "season_id",
    as: "season",
});

OldKnitterSales.belongsTo(FabricType, {
    foreignKey: "fabric_type",
    as: "fabricType_data",
});

OldKnitterSales.belongsTo(Program, {
    foreignKey: "program",
    as: "program_data",
});

OldKnitterSales.sync();
export default OldKnitterSales;