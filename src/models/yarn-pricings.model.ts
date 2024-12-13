import { DataTypes } from 'sequelize';
import db from '../util/dbConn';
import Brand from './brand.model';
import Country from './country.model';
import State from './state.model';
import District from './district.model';

const YarnPricing = db.define('yarn-pricings', {
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
  }
});

YarnPricing.belongsTo(Brand, {
  foreignKey: "brand_id",
  targetKey: "id",
  as: "brand",
});

YarnPricing.belongsTo(Country, {
  foreignKey: "country_id",
  targetKey: "id",
  as: "country",
});

YarnPricing.belongsTo(State, {
  foreignKey: "state_id",
  targetKey: "id",
  as: "state",
});

YarnPricing.belongsTo(District, {
  foreignKey: "district_id",
  targetKey: "id",
  as: "district",
});



export default YarnPricing;