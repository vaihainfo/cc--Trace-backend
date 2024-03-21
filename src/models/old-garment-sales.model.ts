import { DataTypes } from 'sequelize';
import db from '../util/dbConn';
import Program from './program.model';
import Season from './season.model';
import Brand from './brand.model';

const OldGarmentSales = db.define('old_garment_sales', {
    id: {
        type: DataTypes.INTEGER,
        autoIncrement: true,
        primaryKey: true
    },
    garment_id: {
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
    trader_id: {
        type: DataTypes.INTEGER
    },
    buyer_type: {
        type: DataTypes.STRING
    },
    brand_id: {
        type: DataTypes.INTEGER
    },
    department_id: {
        type: DataTypes.INTEGER
    },
    brand_name: {
        type: DataTypes.STRING
    },
    brand_address: {
        type: DataTypes.TEXT
    },
    fabric_length: {
        type: DataTypes.DOUBLE
    },
    add_fabric_length: {
        type: DataTypes.INTEGER
    },
    total_fabric_length: {
        type: DataTypes.INTEGER
    },
    garment_type: {
        type: DataTypes.STRING
    },
    style_mark_no: {
        type: DataTypes.STRING
    },
    garment_size: {
        type: DataTypes.STRING
    },
    colour: {
        type: DataTypes.STRING
    },
    total_no_pc: {
        type: DataTypes.INTEGER
    },
    no_of_box: {
        type: DataTypes.INTEGER
    },
    barcode: {
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
    invoice_no: {
        type: DataTypes.STRING
    },
    box_ids: {
        type: DataTypes.STRING
    },
    bill_of_lading: {
        type: DataTypes.STRING
    },
    transport_info: {
        type: DataTypes.STRING
    },
    contract_no: {
        type: DataTypes.STRING
    },
    embroidering_process: {
        type: DataTypes.STRING
    },
    embroidering_processor_name: {
        type: DataTypes.STRING
    },
    embroidering_address: {
        type: DataTypes.STRING
    },
    embroidering_process_name: {
        type: DataTypes.STRING
    },
    embroidering_process_loss: {
        type: DataTypes.DOUBLE
    },
    final_no_of_pcs: {
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
        type: DataTypes.BIGINT,
        defaultValue: null
    },
    order_to_shipped: {
        type: DataTypes.DOUBLE,
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
    physical_traceability_process: {
        type: DataTypes.SMALLINT,
        defaultValue: "0"
    }
}, {
    timestamps: false
});

OldGarmentSales.belongsTo(Program, {
    foreignKey: "program",
    as: "program_data"
});

OldGarmentSales.belongsTo(Brand, {
    foreignKey: "brand_id",
    as: "brand"
});

OldGarmentSales.belongsTo(Season, {
    foreignKey: "season_id",
    as: "season"
});

OldGarmentSales.sync();
export default OldGarmentSales;