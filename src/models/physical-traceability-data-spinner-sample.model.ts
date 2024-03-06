import { DataTypes } from 'sequelize';
import db from '../util/dbConn';
import PhysicalTraceabilityDataSpinner from './physical-traceability-data-spinner.model';

const PhysicalTraceabilityDataSpinnerSample = db.define('physical_traceability_data_spinner_sample', {
    id: {
        type: DataTypes.INTEGER,
        autoIncrement: true,
        allowNull: false,
        primaryKey: true
    },
    physical_traceability_data_spinner_id: {
        type: DataTypes.INTEGER,
        foreignKey: true,
        references: { model: 'physical_traceability_data_spinners', key: 'id' },
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

PhysicalTraceabilityDataSpinnerSample.belongsTo(PhysicalTraceabilityDataSpinner, {
    foreignKey: "physical_traceability_data_spinner_id",
    as: "physical_traceability_data_spinner",
});

PhysicalTraceabilityDataSpinnerSample.sync();

export default PhysicalTraceabilityDataSpinnerSample;
