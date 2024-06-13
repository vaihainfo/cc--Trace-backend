import { DataTypes } from 'sequelize';
import db from '../util/dbConn';
import Season from './season.model';
import FabricType from './fabric-type.model';
import Program from './program.model';
import Garment from './garment.model';

const OldWeaverSales = db.define('old_weaver_sales', {
    id: {
        type: DataTypes.INTEGER,
        autoIncrement: true,
        primaryKey: true
    },
    weaver_id: {
        type: DataTypes.INTEGER
    },
    date: {
        type: DataTypes.DATE
    },
    order_refernce: {
        type: DataTypes.STRING
    },
    program: {
        type: DataTypes.INTEGER
    },
    buyer_type: {
        type: DataTypes.STRING
    },
    garment_id: {
        type: DataTypes.INTEGER
    },
    garment_name: {
        type: DataTypes.STRING
    },
    garment_address: {
        type: DataTypes.TEXT
    },
    weftchosen: {
        type: DataTypes.STRING
    },
    weft_cottonmix_type: {
        type: DataTypes.STRING
    },
    weft_cottonmix_qty: {
        type: DataTypes.STRING
    },
    warp_yarn_qty: {
        type: DataTypes.DOUBLE
    },
    weft_yarn_qty: {
        type: DataTypes.DOUBLE
    },
    total_yarn_qty: {
        type: DataTypes.DOUBLE
    },
    fabric_type: {
        type: DataTypes.INTEGER
    },
    fabric_construction: {
        type: DataTypes.STRING
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
    bale_ids: {
        type: DataTypes.STRING
    },
    invoice_no: {
        type: DataTypes.STRING
    },
    no_of_bales: {
        type: DataTypes.STRING
    },
    bill_of_lading: {
        type: DataTypes.STRING
    },
    transport_info: {
        type: DataTypes.STRING
    },
    transporter_name: {
        type: DataTypes.STRING
    },
    vehicle_no: {
        type: DataTypes.STRING
    },
    quality_doc: {
        type: DataTypes.STRING
    },
    tc_files: {
        type: DataTypes.STRING
    },
    contract_files: {
        type: DataTypes.STRING
    },
    invoice_files: {
        type: DataTypes.STRING
    },
    delivery_notes: {
        type: DataTypes.STRING
    },
    dyeing_process: {
        type: DataTypes.STRING
    },
    dyeing_processor_name: {
        type: DataTypes.STRING
    },
    dyeing_address: {
        type: DataTypes.STRING
    },
    dyeing_process_name: {
        type: DataTypes.STRING
    },
    dyeing_process_loss: {
        type: DataTypes.DOUBLE
    },
    dyeing_net_weight: {
        type: DataTypes.DOUBLE
    },
    qty_stock: {
        type: DataTypes.DOUBLE
    },
    status: {
        type: DataTypes.INTEGER
    },
    accept_date: {
        type: DataTypes.DATE
    },
    season_id: {
        type: DataTypes.INTEGER,
        defaultValue: null
    },
    transaction_via_trader: {
        type: DataTypes.INTEGER
    },
    transcation_details: {
        type: DataTypes.TEXT
    },
    created_date: {
        type: DataTypes.DATE,
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
        defaultValue: "0"
    },
    weaver_name: {
        type: DataTypes.STRING,
        defaultValue: null
    },
    brand_name: {
        type: DataTypes.STRING,
        defaultValue: null
    },
}, {
    timestamps: false
});

OldWeaverSales.belongsTo(Program, {
    foreignKey: "program",
    as: "program_data"
});

OldWeaverSales.belongsTo(Garment, {
    foreignKey: "garment_id",
    as: "garment"
});

OldWeaverSales.belongsTo(FabricType, {
    foreignKey: "fabric_type",
    as: "fabricType_data"
});

OldWeaverSales.belongsTo(Season, {
    foreignKey: "season_id",
    as: "season"
});

OldWeaverSales.sync();
export default OldWeaverSales;