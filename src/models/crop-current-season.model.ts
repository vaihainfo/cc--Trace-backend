import { DataTypes } from 'sequelize';
import db from '../util/dbConn';

const CropCurrentSeason = db.define('crop_current_season', {
    id: {
        type: DataTypes.INTEGER,
        autoIncrement: true,
        allowNull: false,
        primaryKey: true
    },
    crop_name: {
        type: DataTypes.STRING,
        allowNull: false,
    }
});

export default CropCurrentSeason;