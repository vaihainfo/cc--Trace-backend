import { DataTypes } from "sequelize";
import db from "../util/dbConn";

import Program from "./program.model";
import Brand from "./brand.model";
import FarmGroup from "./farm-group.model";
import Village from "./village.model";
import Country from "./country.model";
import District from "./district.model";
import Block from "./block.model";
import State from "./state.model";
import ICS from "./ics.model";
import Farm from "./farm.model";

const Farmer = db.define("farmers", {
  id: {
    type: DataTypes.INTEGER,
    autoIncrement: true,
    allowNull: false,
    primaryKey: true,
  },
  program_id: {
    allowNull: false,
    type: DataTypes.INTEGER,
    foreignKey: true,
    references: { model: "programs", key: "id" },
    onDelete: "CASCADE",
  },
  brand_id: {
    allowNull: false,
    type: DataTypes.INTEGER,
    foreignKey: true,
    references: { model: "brands", key: "id" },
    onDelete: "CASCADE",
  },
  farmGroup_id: {
    allowNull: false,
    type: DataTypes.INTEGER,
    foreignKey: true,
    references: { model: "farm_groups", key: "id" },
    onDelete: "CASCADE",
  },
  firstName: {
    allowNull: false,
    type: DataTypes.STRING,
  },
  lastName: {
    type: DataTypes.STRING,
  },
  code: {
    allowNull: false,
    type: DataTypes.STRING,
  },
  country_id: {
    type: DataTypes.INTEGER,
    foreignKey: true,
    references: { model: "countries", key: "id" },
    onDelete: "CASCADE",
    allowNull: false,
  },
  state_id: {
    type: DataTypes.INTEGER,
    foreignKey: true,
    references: { model: "states", key: "id" },
    onDelete: "CASCADE",
    allowNull: false,
  },
  district_id: {
    type: DataTypes.INTEGER,
    foreignKey: true,
    references: { model: "districts", key: "id" },
    onDelete: "CASCADE",
    allowNull: false,
  },
  block_id: {
    type: DataTypes.INTEGER,
    foreignKey: true,
    references: { model: "blocks", key: "id" },
    onDelete: "CASCADE",
    allowNull: false,
  },
  village_id: {
    type: DataTypes.INTEGER,
    foreignKey: true,
    references: { model: "villages", key: "id" },
    onDelete: "CASCADE",
    allowNull: false,
  },
  joining_date: {
    type: DataTypes.DATE,
  },
  ics_id: {
    type: DataTypes.INTEGER,
  },
  tracenet_id: {
    type: DataTypes.STRING,
  },
  cert_status: {
    type: DataTypes.STRING,
  },
  qrUrl: {
    type: DataTypes.STRING,
    defaultValue: "",
    allowNull: true
  },
  agri_total_area: {
    type: DataTypes.DECIMAL
  },
  agri_estimated_yeld: {
    type: DataTypes.DECIMAL
  },
  agri_estimated_prod: {
    type: DataTypes.DECIMAL
  },
  cotton_total_area: {
    type: DataTypes.DECIMAL
  },
  total_estimated_cotton: {
    type: DataTypes.DECIMAL
  }
});

Farmer.belongsTo(Program, {
  foreignKey: "program_id",
  as: "program",
});

Farmer.belongsTo(Brand, {
  foreignKey: "brand_id",
  as: "brand",
});

Farmer.belongsTo(FarmGroup, {
  foreignKey: "farmGroup_id",
  as: "farmGroup",
});

Farmer.belongsTo(Village, {
  foreignKey: "village_id",
  as: "village",
});

Farmer.belongsTo(Country, {
  foreignKey: "country_id",
  as: "country",
});

Farmer.belongsTo(State, {
  foreignKey: "state_id",
  as: "state",
});

Farmer.belongsTo(District, {
  foreignKey: "district_id",
  as: "district",
});

Farmer.belongsTo(Block, {
  foreignKey: "block_id",
  as: "block",
});

Farmer.belongsTo(ICS, {
  foreignKey: "ics_id",
  as: "ics",
});

Farmer.associate = (models: any) => {
  Farmer.hasMany(models.FarmerAsset, {
    foreignKey: "farmer_id",
    sourceKey: "id",
    as: "farmerAssets",
  });

  Farmer.hasMany(models.FarmerPlace, {
    foreignKey: "farmer_id",
    sourceKey: "id",
    as: "farmerPlaces",
  });

  Farmer.hasMany(models.Transaction, {
    foreignKey: "farmer_id",
    sourceKey: "id",
    as: "transactions",
  });

  Farmer.hasMany(models.FarmerAgriArea, {
    foreignKey: "farmer_id",
    sourceKey: "id",
    as: "agricultureArea",
  });

  Farmer.hasMany(models.FarmerCottonArea, {
    foreignKey: "farmer_id",
    sourceKey: "id",
    as: "cottonArea",
  });
};

Farmer.sync();

export default Farmer;
