import { DataTypes } from 'sequelize';
import db from '../util/dbConn';
import PhysicalTraceabilityDataGarment from './physical-traceability-data-garment.model';

const PhysicalTraceabilityDataGarmentSample = db.define('physical_traceability_data_garment_sample', {
    id: {
        type: DataTypes.INTEGER,
        autoIncrement: true,
        allowNull: false,
        primaryKey: true
    },
    physical_traceability_data_garment_id: {
        type: DataTypes.INTEGER,
        foreignKey: true,
        references: { model: 'physical_traceability_data_garments', key: 'id' },
        onDelete: 'CASCADE',
        allowNull: false
    },
    weight: {
        type: DataTypes.INTEGER,
        allowNull: false
    },
    cone: {
        type: DataTypes.INTEGER,
        allowNull: false
    },
    original_sample_status: {
        type: DataTypes.STRING,
        allowNull: false
    },
    code: {
        type: DataTypes.STRING,
        allowNull: false
    },
    sample_result: {
        type: DataTypes.SMALLINT,
        allowNull: true,
        defaultValue: null
    }
});

PhysicalTraceabilityDataGarmentSample.belongsTo(PhysicalTraceabilityDataGarment, {
    foreignKey: "physical_traceability_data_garment_id",
    as: "physical_traceability_data_garment",
});

PhysicalTraceabilityDataGarmentSample.sync();

export default PhysicalTraceabilityDataGarmentSample;
