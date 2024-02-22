import { DataTypes } from 'sequelize';
import db from '../util/dbConn';
import SeedTestingLinkage from './seed-testing-linkage.model';

const SeedTestingLinkageReport = db.define('seed_testing_linkage_report', {
    id: {
        type: DataTypes.INTEGER,
        autoIncrement: true,
        allowNull: false,
        primaryKey: true
    },
    seed_testing_linkage_id: {
        type: DataTypes.INTEGER,
        allowNull: false
    },
    report: {
        type: DataTypes.STRING,
        allowNull: false,
    }
});

SeedTestingLinkageReport.belongsTo(SeedTestingLinkage, {
    foreignKey: "seed_testing_linkage_id",
    as: "seed_testing_linkage"
});

export default SeedTestingLinkageReport;