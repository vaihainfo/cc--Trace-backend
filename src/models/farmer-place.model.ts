import { DataTypes } from "sequelize";
import db from "../util/dbConn";

import Farmer from "./farmer.model";

const FarmerPlace = db.define("farmer_places", {
  id: {
    type: DataTypes.INTEGER,
    autoIncrement: true,
    allowNull: false,
    primaryKey: true,
  },
  farmer_id: {
    allowNull: false,
    type: DataTypes.INTEGER,
    foreignKey: true,
    references: { model: "farmers", key: "id" },
    onDelete: "CASCADE",
  },
  houseOwnership: {
    type: DataTypes.STRING,
  },
  electrifiedHouse: {
    type: DataTypes.BOOLEAN,
  },
  houseType: {
    type: DataTypes.STRING,
  },
  waterSource: {
    type: DataTypes.STRING,
  },
  insurance: {
    type: DataTypes.STRING,
  },
  toilet: {
    type: DataTypes.BOOLEAN,
  },
});

FarmerPlace.belongsTo(Farmer, {
  foreignKey: "farmer_id",
  targetKey: "id",
  as: "farmer",
});

export default FarmerPlace;
