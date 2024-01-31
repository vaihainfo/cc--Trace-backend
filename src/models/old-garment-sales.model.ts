import { DataTypes } from 'sequelize';
import db from '../util/dbConn';
import Program from './program.model';
import Season from './season.model';
import Brand from './brand.model';

const OldGarmentSales = db.define('old_garment_sales', {
    id: {
        type: DataTypes.INTEGER,
        autoIncrement: true,
        allowNull: false,
        primaryKey: true
    },
    garment_id: {
        type: DataTypes.INTEGER,
        allowNull: false
    },
    date: {
        type: DataTypes.DATE,
        allowNull: false
    },
    order_refernce: {
        type: DataTypes.STRING,
        allowNull: false
    },
    program: {
        type: DataTypes.INTEGER,
        allowNull: false
    },
    trader_id: {
        type: DataTypes.INTEGER,
        allowNull: false
    },
    buyer_type: {
        type: DataTypes.STRING,
        allowNull: false
    },
    brand_id: {
        type: DataTypes.INTEGER,
        allowNull: false
    },
    department_id: {
        type: DataTypes.INTEGER,
        allowNull: false
    },
    brand_name: {
        type: DataTypes.STRING,
        allowNull: false
    },
    brand_address: {
        type: DataTypes.TEXT
    },
    fabric_length: {
        type: DataTypes.DOUBLE,
        allowNull: false
    },
    add_fabric_length: {
        type: DataTypes.INTEGER,
        allowNull: false
    },
    total_fabric_length: {
        type: DataTypes.INTEGER,
        allowNull: false
    },
    garment_type: {
        type: DataTypes.STRING,
        allowNull: false
    },
    style_mark_no: {
        type: DataTypes.STRING,
        allowNull: false
    },
    garment_size: {
        type: DataTypes.STRING,
        allowNull: false
    },
    colour: {
        type: DataTypes.STRING,
        allowNull: false
    },
    total_no_pc: {
        type: DataTypes.INTEGER,
        allowNull: false
    },
    no_of_box: {
        type: DataTypes.INTEGER,
        allowNull: false
    },
    barcode: {
        type: DataTypes.STRING,
        allowNull: false
    },
    tc_files: {
        type: DataTypes.STRING,
        allowNull: false
    },
    contract_files: {
        type: DataTypes.STRING,
        allowNull: false
    },
    invoice_files: {
        type: DataTypes.STRING,
        allowNull: false
    },
    delivery_notes: {
        type: DataTypes.STRING,
        allowNull: false
    },
    invoice_no: {
        type: DataTypes.STRING,
        allowNull: false
    },
    box_ids: {
        type: DataTypes.STRING,
        allowNull: false
    },
    bill_of_lading: {
        type: DataTypes.STRING,
        allowNull: false
    },
    transport_info: {
        type: DataTypes.STRING,
        allowNull: false
    },
    contract_no: {
        type: DataTypes.STRING,
        allowNull: false
    },
    embroidering_process: {
        type: DataTypes.STRING,
        allowNull: false
    },
    embroidering_processor_name: {
        type: DataTypes.STRING,
        allowNull: false
    },
    embroidering_address: {
        type: DataTypes.STRING,
        allowNull: false
    },
    embroidering_process_name: {
        type: DataTypes.STRING,
        allowNull: false
    },
    embroidering_process_loss: {
        type: DataTypes.DOUBLE,
        allowNull: false
    },
    final_no_of_pcs: {
        type: DataTypes.DOUBLE,
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
    accept_date: {
        type: DataTypes.DATE,
        allowNull: false
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
        type: DataTypes.INTEGER,
        allowNull: false
    },
    transcation_details: {
        type: DataTypes.TEXT
    },
    created_date: {
        type: DataTypes.DATE,
        allowNull: false,
        defaultValue: new Date()
    },
    physical_traceability_process: {
        type: DataTypes.SMALLINT,
        allowNull: false,
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