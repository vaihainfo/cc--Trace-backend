import { DataTypes } from 'sequelize';
import db from '../util/dbConn';
import PhysicalPartner from './physical-partner.model';
import GinProcess from './gin-process.model';
import Ginner from './ginner.model';

const PhysicalTraceabilityDataGinner = db.define('physical_traceability_data_ginner', {
    id: {
        type: DataTypes.INTEGER,
        autoIncrement: true,
        allowNull: false,
        primaryKey: true
    },
    end_date_of_DNA_marker_application: {
        type: DataTypes.DATE,
        allowNull: false
    },
    date_sample_collection: {
        type: DataTypes.DATE,
        allowNull: false
    },
    data_of_sample_dispatch: {
        type: DataTypes.STRING,
        allowNull: false
    },
    operator_name: {
        type: DataTypes.STRING,
        allowNull: false
    },
    cotton_connect_executive_name: {
        type: DataTypes.STRING,
        allowNull: false
    },
    healixa_lot_no: {
        type: DataTypes.STRING,
        allowNull: true
    },
    expected_date_of_lint_sale: {
        type: DataTypes.DATE,
        allowNull: false
    },
    physical_traceability_partner_id: {
        type: DataTypes.INTEGER,
        foreignKey: true,
        references: { model: 'physical_partners', key: 'id' },
        onDelete: 'CASCADE',
        allowNull: false
    },
    gin_process_id: {
        type: DataTypes.INTEGER,
        foreignKey: true,
        references: { model: 'gin_processes', key: 'id' },
        onDelete: 'CASCADE',
        allowNull: false
    },
    ginner_id: {
        type: DataTypes.INTEGER,
        foreignKey: true,
        references: { model: 'ginners', key: 'id' },
        onDelete: 'CASCADE',
        allowNull: false
    },
    upload_report: {
        type: DataTypes.ARRAY(DataTypes.STRING),
        allowNull: true,
        defaultValue: null
    }
});

PhysicalTraceabilityDataGinner.belongsTo(PhysicalPartner, {
    foreignKey: "physical_traceability_partner_id",
    as: "physical_traceability_partner",
});

PhysicalTraceabilityDataGinner.belongsTo(GinProcess, {
    foreignKey: "gin_process_id",
    as: "gin_process",
});

PhysicalTraceabilityDataGinner.belongsTo(Ginner, {
    foreignKey: "ginner_id",
    as: "ginner",
});

PhysicalTraceabilityDataGinner.sync();

export default PhysicalTraceabilityDataGinner;