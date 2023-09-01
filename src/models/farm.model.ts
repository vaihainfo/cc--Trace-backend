import { DataTypes } from 'sequelize';
import db from '../util/dbConn';
import Farmer from './farmer.model';
import Program from './program.model';
import Season from './season.model';
import FarmerAgriArea from './farmer-agri-area.model';
import FarmerCottonArea from './farmer-cotton-area.model';

const Farm = db.define('farms', {
    id: {
        type: DataTypes.INTEGER,
        autoIncrement: true,
        allowNull: false,
        primaryKey: true
    },
    farmer_id: {
        type: DataTypes.INTEGER,
        foreignKey: true,
        references: { model: 'farmers', key: 'id' },
        onDelete: 'CASCADE',
        allowNull: false,
    },
    season_id: {
        type: DataTypes.INTEGER,
        allowNull: false,
        foreignKey: true,
        references: { model: 'seasons', key: 'id' },
        onDelete: 'CASCADE'
    },
    program_id: {
        allowNull: false,
        foreignKey: true,
        references: { model: 'programs', key: 'id' },
        onDelete: 'CASCADE',
        type: DataTypes.INTEGER
    },
    agri_id: {
        allowNull: false,
        foreignKey: true,
        references: { model: 'farmer_agri_areas', key: 'id' },
        onDelete: 'CASCADE',
        type: DataTypes.INTEGER
    },
    cotton_id: {
        allowNull: false,
        foreignKey: true,
        references: { model: 'farmer_cotton_areas', key: 'id' },
        onDelete: 'CASCADE',
        type: DataTypes.INTEGER
    },
    agri_total_area: {
        allowNull: false,
        type: DataTypes.STRING
    },
    cotton_total_area: {
        allowNull: false,
        type: DataTypes.STRING
    }
});

Farm.belongsTo(Farmer, {
    foreignKey: "farmer_id",
    as: "farmer",
})

Farm.belongsTo(Program, {
    foreignKey: "program_id",
    as: "program",
})

Farm.belongsTo(Season, {
    foreignKey: "season_id",
    as: "season",
})

Farm.belongsTo(FarmerAgriArea, {
    foreignKey: "agri_id",
    as: "farmerAgriArea",
})

Farm.belongsTo(FarmerCottonArea, {
    foreignKey: "cotton_id",
    as: "farmerCottonArea",
})

export default Farm;