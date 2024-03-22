import { DataTypes } from 'sequelize';
import db from '../util/dbConn';
import PhysicalPartner from './physical-partner.model';
import WeaverProcess from './weaver-process.model';
import Weaver from './weaver.model';

const PhysicalTraceabilityDataWeaver = db.define('physical_traceability_data_weaver', {
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
    weav_process_id: {
        type: DataTypes.INTEGER,
        foreignKey: true,
        references: { model: 'weaver_processes', key: 'id' },
        onDelete: 'CASCADE',
        allowNull: false
    },
    weaver_id: {
        type: DataTypes.INTEGER,
        foreignKey: true,
        references: { model: 'weavers', key: 'id' },
        onDelete: 'CASCADE',
        allowNull: false
    },
    upload_report: {
        type: DataTypes.ARRAY(DataTypes.STRING),
        allowNull: true,
        defaultValue: null
    }
});

PhysicalTraceabilityDataWeaver.belongsTo(PhysicalPartner, {
    foreignKey: "physical_traceability_partner_id",
    as: "physical_traceability_partner",
});

PhysicalTraceabilityDataWeaver.belongsTo(WeaverProcess, {
    foreignKey: "weav_process_id",
    as: "weav_process",
});

PhysicalTraceabilityDataWeaver.belongsTo(Weaver, {
    foreignKey: "weaver_id",
    as: "weaver",
});

PhysicalTraceabilityDataWeaver.sync();

export default PhysicalTraceabilityDataWeaver;