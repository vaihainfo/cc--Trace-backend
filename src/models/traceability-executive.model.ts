import { DataTypes } from 'sequelize';
import db from '../util/dbConn';

import Country from './country.model';

const TraceabilityExecutive = db.define('traceability_executives', {
  id: {
    type: DataTypes.INTEGER,
    autoIncrement: true,
    allowNull: false,
    primaryKey: true
  },
  name: {
    allowNull: false,
    type: DataTypes.TEXT
  },
  country_id: {
    type: DataTypes.INTEGER,
    foreignKey: true,
    references: { model: 'countries', key: 'id' },
    onDelete: 'CASCADE',
    allowNull: false,
  },
  program_id: {
    allowNull: false,
    type: DataTypes.ARRAY(DataTypes.INTEGER)
  },
  brand: {
    allowNull: false,
    type: DataTypes.ARRAY(DataTypes.INTEGER)
  },
  mapped_states: {
    type: DataTypes.ARRAY(DataTypes.INTEGER)
  },
  mapped_ginners: {
    type: DataTypes.ARRAY(DataTypes.INTEGER)
  },
  mapped_spinners: {
    type: DataTypes.ARRAY(DataTypes.INTEGER)
  },
  mapped_to: {
    type: DataTypes.STRING
  },
  mobile: {
    type: DataTypes.STRING
  },
  email: {
    type: DataTypes.STRING
  },
  teUser_id: {
    allowNull: false,
    type: DataTypes.ARRAY(DataTypes.INTEGER)
  },
  status: {
    allowNull: false,
    defaultValue: true,
    type: DataTypes.BOOLEAN
  },
});

TraceabilityExecutive.belongsTo(Country, {
  foreignKey: "country_id",
  as: "country",
});


TraceabilityExecutive.sync();

export default TraceabilityExecutive;
