import { DataTypes } from 'sequelize';
import db from '../util/dbConn';
// import Brand from './brand.model';
// import Country from './country.model';
// import State from './state.model';
// import District from './district.model';

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

// SeedCottonPricing.belongsTo(Brand, {
//   foreignKey: "brand_id",
//   targetKey: "id",
//   as: "brand",
// });

// SeedCottonPricing.belongsTo(Country, {
//   foreignKey: "country_id",
//   targetKey: "id",
//   as: "country",
// });

// SeedCottonPricing.belongsTo(State, {
//   foreignKey: "state_id",
//   targetKey: "id",
//   as: "state",
// });

// SeedCottonPricing.belongsTo(District, {
//   foreignKey: "district_id",
//   targetKey: "id",
//   as: "district",
// });


export default SeedCottonPricing;