import { DataTypes } from 'sequelize';
import db from '../util/dbConn';

import Ginner from './ginner.model';
import Season from './season.model';
import Program from './program.model';
import Brand from './brand.model';

const GinAllocatedSeedCotton = db.define('gin_allocated_seed_cottons', {
  id: {
    type: DataTypes.INTEGER,
    autoIncrement: true,
    allowNull: false,
    primaryKey: true
  },
  ginner_id: {
    type: DataTypes.INTEGER,
    allowNull: false,
  },
  season_id: {
    type: DataTypes.INTEGER,
    allowNull: false
  },
  program_id: {
    allowNull: false,
    type: DataTypes.INTEGER
  },
  brand_id: {
    allowNull: false,
    type: DataTypes.INTEGER
  },
  allocated_seed_cotton: {
    allowNull: false,
    type: DataTypes.DOUBLE
  }
});

GinAllocatedSeedCotton.belongsTo(Season, {
  foreignKey: "season_id",
  as: "season",
});

GinAllocatedSeedCotton.belongsTo(Program, {
  foreignKey: "program_id",
  as: "program",
});

GinAllocatedSeedCotton.belongsTo(Brand, {
  foreignKey: "brand_id",
  as: "brand",
});

GinAllocatedSeedCotton.belongsTo(Ginner, {
  foreignKey: "ginner_id",
  as: "ginner",
});

GinAllocatedSeedCotton.sync();

export default GinAllocatedSeedCotton;