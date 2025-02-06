import SpinCombernoilSale from "./spin_combernoil_sale.model";
import CombernoilGeneration from "./combernoil_generation.model";
import Season from "./season.model";
import Program from "./program.model";
import Spinner from "./spinner.model";

export function setupAssociations() {
  console.log("setupAssociations");
  SpinCombernoilSale.hasMany(CombernoilGeneration, {
    foreignKey: "sales_id",
    sourceKey: "id",
    as: "combernoilGeneration",
  });

  CombernoilGeneration.belongsTo(SpinCombernoilSale, {
    foreignKey: "sales_id",
    targetKey: "id",
    as: "spinCombernoilSale",
  });

  SpinCombernoilSale.belongsTo(Season, {
    foreignKey: "season_id",
    as: "season",
  });

  Season.hasMany(SpinCombernoilSale, {
    foreignKey: "season_id",
    as: "spinCombernoilSales",
  });

  // Add these associations
  SpinCombernoilSale.belongsTo(Program, {
    foreignKey: "program_id",
    as: "program",
  });

  Program.hasMany(SpinCombernoilSale, {
    foreignKey: "program_id",
    as: "spinCombernoilSales",
  });

  // Add these associations
  SpinCombernoilSale.belongsTo(Spinner, {
    foreignKey: "spinner_id",
    as: "spinner",
  });

  Spinner.hasMany(SpinCombernoilSale, {
    foreignKey: "spinner_id",
    as: "spinCombernoilSales",
  });
}
