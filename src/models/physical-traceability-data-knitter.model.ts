import { DataTypes } from 'sequelize';
import db from '../util/dbConn';
import PhysicalPartner from './physical-partner.model';
import KnitProcess from './knit-process.model';
import Knitter from './knitter.model';

const PhysicalTraceabilityDataKnitter = db.define('physical_traceability_data_knitter', {
    id: {
        type: DataTypes.INTEGER,
        autoIncrement: true,
        allowNull: false,
        primaryKey: true
    },
    dna_marker_lot: {
        type: DataTypes.STRING,
        allowNull: true,
        defaultValue: null
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
    expected_date_of_fabric_sale: {
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
    knit_process_id: {
        type: DataTypes.INTEGER,
        foreignKey: true,
        references: { model: 'knit_processes', key: 'id' },
        onDelete: 'CASCADE',
        allowNull: false
    },
    knitter_id: {
        type: DataTypes.INTEGER,
        foreignKey: true,
        references: { model: 'knitters', key: 'id' },
        onDelete: 'CASCADE',
        allowNull: false
    },
    upload_report: {
        type: DataTypes.ARRAY(DataTypes.STRING),
        allowNull: true,
        defaultValue: null
    }
});

PhysicalTraceabilityDataKnitter.belongsTo(PhysicalPartner, {
    foreignKey: "physical_traceability_partner_id",
    as: "physical_traceability_partner",
});

PhysicalTraceabilityDataKnitter.belongsTo(KnitProcess, {
    foreignKey: "knit_process_id",
    as: "knit_process",
});

PhysicalTraceabilityDataKnitter.belongsTo(Knitter, {
    foreignKey: "knitter_id",
    as: "knitter",
});

PhysicalTraceabilityDataKnitter.sync();

export default PhysicalTraceabilityDataKnitter;