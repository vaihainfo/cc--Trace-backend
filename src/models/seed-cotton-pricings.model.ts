import { DataTypes } from 'sequelize';
import db from '../util/dbConn';
import Country from './country.model';

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
  programme_price: {
    type: DataTypes.DECIMAL,
    allowNull: false,
  }
});

SeedCottonPricing.belongsTo(Country, {
  foreignKey: "country_id",
  as: "country",
});


export default SeedCottonPricing;