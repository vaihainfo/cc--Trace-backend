import { DataTypes } from 'sequelize';
import db from '../util/dbConn';
import Season from './season.model';
import SeedCompany from './seed-company.model';

const SeedAvailability = db.define('seed_availability', {
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
    lot_no: {
        type: DataTypes.STRING,
        allowNull: false
    },
    variety: {
        type: DataTypes.STRING,
        allowNull: false
    },
    pkt: {
        type: DataTypes.STRING,
        allowNull: false
    },
    state: {
        type: DataTypes.STRING,
        allowNull: false
    }
});

SeedAvailability.belongsTo(Season, {
    foreignKey: "season_id",
    as: "season"
});

SeedAvailability.belongsTo(SeedCompany, {
    foreignKey: "seed_company_id",
    as: "seed_company"
});

export default SeedAvailability;