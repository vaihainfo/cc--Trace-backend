import { DataTypes } from 'sequelize';
import db from '../util/dbConn';
import Season from './season.model';
import SeedCompany from './seed-company.model';
import LabMaster from './lab-master.model';

const SeedTestingLinkage = db.define('seed_testing_linkage', {
    id: {
        type: DataTypes.INTEGER,
        autoIncrement: true,
        allowNull: false,
        primaryKey: true
    },
    season_id: {
        type: DataTypes.INTEGER,
        allowNull: false
    },
    seed_company_id: {
        type: DataTypes.INTEGER,
        allowNull: false
    },
    lotno: {
        type: DataTypes.STRING,
        allowNull: false
    },
    variety: {
        type: DataTypes.STRING,
        allowNull: false
    },
    packets: {
        type: DataTypes.STRING,
        allowNull: false
    },
    district: {
        type: DataTypes.STRING,
        allowNull: false
    },
    state: {
        type: DataTypes.STRING,
        allowNull: false
    },
    testing_code: {
        type: DataTypes.STRING,
        allowNull: false
    },
    seal_no: {
        type: DataTypes.STRING,
        allowNull: false
    },
    date_sending_sample: {
        type: DataTypes.DATE,
        allowNull: false
    },
    date_of_report: {
        type: DataTypes.DATE,
        allowNull: false
    },
    report_no: {
        type: DataTypes.STRING,
        allowNull: false
    },
    nos: {
        type: DataTypes.STRING,
        allowNull: false
    },
    thirtyfives: {
        type: DataTypes.STRING,
        allowNull: false
    },
    result_of_lab: {
        type: DataTypes.STRING,
        allowNull: false
    },
    lab_master_id: {
        type: DataTypes.INTEGER,
        allowNull: false
    }
});

SeedTestingLinkage.belongsTo(Season, {
    foreignKey: "season_id",
    as: "season"
});

SeedTestingLinkage.belongsTo(SeedCompany, {
    foreignKey: "seed_company_id",
    as: "seed_company"
});

SeedTestingLinkage.belongsTo(LabMaster, {
    foreignKey: "lab_master_id",
    as: "lab_master"
});

export default SeedTestingLinkage;