import { DataTypes } from 'sequelize';
import db from '../util/dbConn';
import PhysicalPartner from './physical-partner.model';
import SpinProcess from './spin-process.model';
import Spinner from './spinner.model';

const PhysicalTraceabilityDataSpinner = db.define('physical_traceability_data_spinner', {
    id: {
        type: DataTypes.INTEGER,
        autoIncrement: true,
        allowNull: false,
        primaryKey: true
    },
    end_date_of_DNA_marker_application: {
        type: DataTypes.DATE,
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
    healixa_lot_no: {
        type: DataTypes.STRING,
        allowNull: true
    },
    expected_date_of_yarn_sale: {
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
    spin_process_id: {
        type: DataTypes.INTEGER,
        foreignKey: true,
        references: { model: 'spin_processes', key: 'id' },
        onDelete: 'CASCADE',
        allowNull: false
    },
    spinner_id: {
        type: DataTypes.INTEGER,
        foreignKey: true,
        references: { model: 'spinners', key: 'id' },
        onDelete: 'CASCADE',
        allowNull: false
    },
    upload_report: {
        type: DataTypes.ARRAY(DataTypes.STRING),
        allowNull: true,
        defaultValue: null
    }
});

PhysicalTraceabilityDataSpinner.belongsTo(PhysicalPartner, {
    foreignKey: "physical_traceability_partner_id",
    as: "physical_traceability_partner",
});

PhysicalTraceabilityDataSpinner.belongsTo(SpinProcess, {
    foreignKey: "spin_process_id",
    as: "spin_process",
});

PhysicalTraceabilityDataSpinner.belongsTo(Spinner, {
    foreignKey: "spinner_id",
    as: "spinner",
});

PhysicalTraceabilityDataSpinner.sync();

export default PhysicalTraceabilityDataSpinner;