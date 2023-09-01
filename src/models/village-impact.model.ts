import { DataTypes  } from 'sequelize';
import db  from '../util/dbConn';

const VillageImpact = db.define('village_impacts',{
  id: {
    type: DataTypes.INTEGER,
    autoIncrement: true,
    allowNull: false,
    primaryKey: true
  },
  village: {
    allowNull: false,
    type: DataTypes.STRING
  },
  reduced_chemical_pesticide: {
    type: DataTypes.FLOAT
  },
  reduced_chemical_fertilizer: {
    type: DataTypes.FLOAT
  },
  reduced_water_use: {
    type: DataTypes.FLOAT
  },
  increased_yield: {
    type: DataTypes.FLOAT
  },
  reduced_input_costs: {
    type: DataTypes.FLOAT
  },
  increased_profit: {
    type: DataTypes.FLOAT
  },
});

export default VillageImpact;