import { DataTypes } from 'sequelize';
import db from '../util/dbConn';
import Season from './season.model';
import FarmGroup from './farm-group.model';
import CropCurrentSeason from './crop-current-season.model';
import ICS from './ics.model';

const IcsQuantityEstimation = db.define('ics_quantity_estimation', {
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
    farm_group_id: {
        type: DataTypes.INTEGER,
        allowNull: false
    },
    ics_id: {
        type: DataTypes.INTEGER,
        allowNull: false
    },
    no_of_farmer: {
        type: DataTypes.STRING,
        allowNull: false
    },
    total_area: {
        type: DataTypes.STRING,
        allowNull: false
    },
    est_cotton_area: {
        type: DataTypes.STRING,
        allowNull: false
    },
    estimated_lint: {
        type: DataTypes.STRING,
        allowNull: false
    },
    verified_row_cotton: {
        type: DataTypes.STRING,
        allowNull: false
    },
    verified_ginner: {
        type: DataTypes.STRING,
        allowNull: false
    },
    crop_current_season_id: {
        type: DataTypes.INTEGER,
        allowNull: false
    },
    organic_standard: {
        type: DataTypes.STRING,
        allowNull: false
    },
    certification_body: {
        type: DataTypes.STRING,
        allowNull: false
    },
    scope_issued_date: {
        type: DataTypes.STRING,
        allowNull: false
    },
    scope_certification_validity: {
        type: DataTypes.STRING,
        allowNull: false
    },
    scope_certification_no: {
        type: DataTypes.STRING,
        allowNull: false
    },
    nop_scope_certification_no: {
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
    remark: {
        type: DataTypes.STRING,
        allowNull: false
    }
});

IcsQuantityEstimation.belongsTo(Season, {
    foreignKey: "season_id",
    as: "season"
});

IcsQuantityEstimation.belongsTo(FarmGroup, {
    foreignKey: "farm_group_id",
    as: "farm_group"
});

IcsQuantityEstimation.belongsTo(ICS, {
    foreignKey: "ics_id",
    as: "ics"
});

IcsQuantityEstimation.belongsTo(CropCurrentSeason, {
    foreignKey: "crop_current_season_id",
    as: "crop_current_season"
});

export default IcsQuantityEstimation;