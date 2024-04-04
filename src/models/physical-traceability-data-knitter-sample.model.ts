import { DataTypes } from 'sequelize';
import db from '../util/dbConn';
import PhysicalTraceabilityDataKnitter from './physical-traceability-data-knitter.model';

const PhysicalTraceabilityDataKnitterSample = db.define('physical_traceability_data_knitter_sample', {
    id: {
        type: DataTypes.INTEGER,
        autoIncrement: true,
        allowNull: false,
        primaryKey: true
    },
    physical_traceability_data_knitter_id: {
        type: DataTypes.INTEGER,
        foreignKey: true,
        references: { model: 'physical_traceability_data_knitters', key: 'id' },
        onDelete: 'CASCADE',
        allowNull: false
    },
    weight: {
        type: DataTypes.INTEGER,
        allowNull: false
    },
    roll: {
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

PhysicalTraceabilityDataKnitterSample.belongsTo(PhysicalTraceabilityDataKnitter, {
    foreignKey: "physical_traceability_data_knitter_id",
    as: "physical_traceability_data_knitter",
});

PhysicalTraceabilityDataKnitterSample.sync();

export default PhysicalTraceabilityDataKnitterSample;
