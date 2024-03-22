import { DataTypes } from 'sequelize';
import db from '../util/dbConn';
import PhysicalPartner from './physical-partner.model';
import GarmentProcess from './garment-process..model';
import Garment from './garment.model';

const PhysicalTraceabilityDataGarment = db.define('physical_traceability_data_garment', {
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
    expected_date_of_garment_sale: {
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
    garm_process_id: {
        type: DataTypes.INTEGER,
        foreignKey: true,
        references: { model: 'garment_processes', key: 'id' },
        onDelete: 'CASCADE',
        allowNull: false
    },
    garment_id: {
        type: DataTypes.INTEGER,
        foreignKey: true,
        references: { model: 'garments', key: 'id' },
        onDelete: 'CASCADE',
        allowNull: false
    },
    upload_report: {
        type: DataTypes.ARRAY(DataTypes.STRING),
        allowNull: true,
        defaultValue: null
    }
});

PhysicalTraceabilityDataGarment.belongsTo(PhysicalPartner, {
    foreignKey: "physical_traceability_partner_id",
    as: "physical_traceability_partner",
});

PhysicalTraceabilityDataGarment.belongsTo(GarmentProcess, {
    foreignKey: "garm_process_id",
    as: "garm_process",
});

PhysicalTraceabilityDataGarment.belongsTo(Garment, {
    foreignKey: "garment_id",
    as: "garment",
});

PhysicalTraceabilityDataGarment.sync();

export default PhysicalTraceabilityDataGarment;