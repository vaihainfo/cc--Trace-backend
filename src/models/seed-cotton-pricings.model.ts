import { DataTypes } from 'sequelize';
import db from '../util/dbConn';

const SeedCottonPricing = db.define('seed-cotton-pricings', {
  id: {
    allowNull: false,
    autoIncrement: true,
    primaryKey: true,
    type: DataTypes.INTEGER
  },
  startDate: {
    type: DataTypes.DATE,
    allowNull: false,
  },
  endDate: {
    type: DataTypes.DATE,
    allowNull: false,
  },
  program_id: {
    type: DataTypes.INTEGER,
    allowNull: false,
  },
  brand_id: {
    type: DataTypes.INTEGER,
    allowNull: false,
  },
  season_id: {
    type: DataTypes.INTEGER,
    allowNull: false,
  },
  country_id: {
    type: DataTypes.INTEGER,
    allowNull: false,
  },
  state_id: {
    type: DataTypes.INTEGER,
    allowNull: false,
  },
  district_id: {
    type: DataTypes.INTEGER,
    allowNull: false,
  },
  market_price: {
    type: DataTypes.DECIMAL,
    allowNull: false,
  },
});


export default SeedCottonPricing;