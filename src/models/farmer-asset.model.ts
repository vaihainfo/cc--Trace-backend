import { DataTypes } from "sequelize";
import db from "../util/dbConn";

import Farmer from "./farmer.model";

const FarmerAsset = db.define("farmer_assets", {
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
  electronics: {
    type: DataTypes.STRING,
  },
  vehicle: {
    type: DataTypes.STRING,
  },
  cellphone: {
    type: DataTypes.BOOLEAN,
  },
  bankAccount: {
    type: DataTypes.BOOLEAN,
  },
  loanInfo: {
    type: DataTypes.STRING,
  },
});

FarmerAsset.belongsTo(Farmer, {
  foreignKey: "farmer_id",
  targetKey: "id",
  as: "farmer",
});

export default FarmerAsset;
