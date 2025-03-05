import { DataTypes } from 'sequelize';
import db from '../util/dbConn';
import Brand from './brand.model';

const OldConsolidateReport = db.define('old_consolidated_traceability_report', {
    id: {
        type: DataTypes.INTEGER,
        autoIncrement: true,
        primaryKey: true
    },
    created_date: {
        type: DataTypes.DATE
    },
    brand_id: {
        type: DataTypes.INTEGER
    },
    date_of_dispatch: {
        type: DataTypes.DATE
    },
    garment_unit_name: {
        type: DataTypes.STRING
    },
    invoice_numb: {
        type: DataTypes.STRING
    },
    mark_style_no: {
        type: DataTypes.STRING
    },
    item_description: {
        type: DataTypes.STRING
    },
    no_of_boxes_cartons: {
        type: DataTypes.STRING
    },
    no_of_pieces: {
        type: DataTypes.STRING
    },
    box_carton_id: {
        type: DataTypes.STRING
    },
    garment_size: {
        type: DataTypes.STRING
    },
    date_of_fabric_sale: {
        type: DataTypes.DATE
    },
    fabric_processor_name: {
        type: DataTypes.STRING
    },
    invoice_num: {
        type: DataTypes.STRING
    },
    lot_no: {
        type: DataTypes.STRING
    },
    fabric_type: {
        type: DataTypes.STRING
    },
    no_of_bale: {
        type: DataTypes.STRING
    },
    bale_id: {
        type: DataTypes.STRING
    },
    fabric_length: {
        type: DataTypes.STRING
    },
    nett_weight: {
        type: DataTypes.STRING
    },
    date_of_yarn_sale: {
        type: DataTypes.STRING
    },
    spinner_name: {
        type: DataTypes.STRING
    },
    invoice_number: {
        type: DataTypes.STRING
    },
    lot_batch_number: {
        type: DataTypes.STRING
    },
    yarn_type: {
        type: DataTypes.STRING
    },
    yarn_count: {
        type: DataTypes.STRING
    },
    no_of_boxes: {
        type: DataTypes.STRING
    },
    box_id: {
        type: DataTypes.STRING
    },
    net_weight: {
        type: DataTypes.STRING
    },
    date_of_lint_sale: {
        type: DataTypes.STRING
    },
    invoice_no: {
        type: DataTypes.STRING
    },
    ginner_name: {
        type: DataTypes.STRING
    },
    bale_lot_no: {
        type: DataTypes.STRING
    },
    no_of_bales: {
        type: DataTypes.STRING
    },
    press_bale_nos: {
        type: DataTypes.STRING
    },
    total_qty: {
        type: DataTypes.STRING
    },
    date_of_sale: {
        type: DataTypes.STRING
    },
    farmer_group_name: {
        type: DataTypes.STRING
    },
    transaction_id: {
        type: DataTypes.STRING
    },
    village: {
        type: DataTypes.STRING
    },
    state: {
        type: DataTypes.STRING
    },
    program: {
        type: DataTypes.STRING
    }
    

   
}, {
    timestamps: false
});


OldConsolidateReport.belongsTo(Brand, {
    foreignKey: "brand_id",
    as: "brand"
});


OldConsolidateReport.sync();
export default OldConsolidateReport;