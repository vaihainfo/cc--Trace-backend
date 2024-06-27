import { DataTypes  } from 'sequelize';
import db  from '../util/dbConn';

import Ginner from './ginner.model';
import Season from './season.model';

const GinnerExpectedCotton = db.define('ginner_expected_cottons',{
  id: {
    type: DataTypes.INTEGER,
    autoIncrement: true,
    allowNull: false,
    primaryKey: true
  },
  season_id: {
    type: DataTypes.INTEGER
  },
  upload_date: {
    type: DataTypes.DATE
  },
  ginner_id: {
    type: DataTypes.INTEGER,
    references: { model: 'ginners', key: 'id' },
    onDelete: 'CASCADE',
  },
  ginning_mill: {
    type: DataTypes.STRING
  },
  brand_id: {
    type: DataTypes.INTEGER
  },
  program_id: {
    type: DataTypes.INTEGER
  },
  expected_seed_cotton: {
    type: DataTypes.STRING
  },
  expected_lint: {
    type: DataTypes.STRING
  },
});

GinnerExpectedCotton.belongsTo(Ginner, {
  foreignKey: "ginner_id",
  as: "ginner_expected_cotton",
});

GinnerExpectedCotton.belongsTo(Season, {
  foreignKey: "season_id",
  as: "season",
});

GinnerExpectedCotton.sync();

export default GinnerExpectedCotton;