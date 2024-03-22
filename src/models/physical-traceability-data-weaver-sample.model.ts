import { DataTypes } from 'sequelize';
import db from '../util/dbConn';
import PhysicalTraceabilityDataWeaver from './physical-traceability-data-weaver.model';

const PhysicalTraceabilityDataWeaverSample = db.define('physical_traceability_data_weaver_sample', {
    id: {
        type: DataTypes.INTEGER,
        autoIncrement: true,
        allowNull: false,
        primaryKey: true
    },
    physical_traceability_data_weaver_id: {
        type: DataTypes.INTEGER,
        foreignKey: true,
        references: { model: 'physical_traceability_data_weavers', key: 'id' },
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

PhysicalTraceabilityDataWeaverSample.belongsTo(PhysicalTraceabilityDataWeaver, {
    foreignKey: "physical_traceability_data_weaver_id",
    as: "physical_traceability_data_weaver",
});

PhysicalTraceabilityDataWeaverSample.sync();

export default PhysicalTraceabilityDataWeaverSample;
