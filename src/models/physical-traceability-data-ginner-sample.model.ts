import { DataTypes } from 'sequelize';
import db from '../util/dbConn';
import PhysicalTraceabilityDataGinner from './physical-traceability-data-ginner.model';

const PhysicalTraceabilityDataGinnerSample = db.define('physical_traceability_data_ginner_sample', {
    id: {
        type: DataTypes.INTEGER,
        autoIncrement: true,
        allowNull: false,
        primaryKey: true
    },
    physical_traceability_data_ginner_id: {
        type: DataTypes.INTEGER,
        foreignKey: true,
        references: { model: 'physical_traceability_data_ginners', key: 'id' },
        onDelete: 'CASCADE',
        allowNull: false
    },
    weight: {
        type: DataTypes.INTEGER,
        allowNull: false
    },
    bale_no: {
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

PhysicalTraceabilityDataGinnerSample.belongsTo(PhysicalTraceabilityDataGinner, {
    foreignKey: "physical_traceability_data_ginner_id",
    as: "physical_traceability_data_ginner",
});

PhysicalTraceabilityDataGinnerSample.sync();

export default PhysicalTraceabilityDataGinnerSample;
