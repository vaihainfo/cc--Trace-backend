import { DataTypes } from 'sequelize';
import db from '../util/dbConn';
import Season from './season.model';
import SeedCompany from './seed-company.model';

const SeedDemand = db.define('seed_demand', {
    id: {
        type: DataTypes.INTEGER,
        autoIncrement: true,
        allowNull: false,
        primaryKey: true
    },
    season_id: {
        type: DataTypes.INTEGER,
        allowNull: false,
    },
    project_name: {
        type: DataTypes.STRING,
        allowNull: false
    },
    seed_company_id: {
        type: DataTypes.INTEGER,
        allowNull: false
    },
    seed_variety: {
        type: DataTypes.STRING,
        allowNull: false
    },
    numbers_of_packets: {
        type: DataTypes.STRING,
        allowNull: false
    },
    project_location: {
        type: DataTypes.STRING,
        allowNull: false
    },
    remark: {
        type: DataTypes.STRING,
        allowNull: false
    }
});

SeedDemand.belongsTo(Season, {
    foreignKey: "season_id",
    as: "season"
});

SeedDemand.belongsTo(SeedCompany, {
    foreignKey: "seed_company_id",
    as: "seed_company"
});

export default SeedDemand;