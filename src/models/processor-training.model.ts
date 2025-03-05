import { DataTypes  } from 'sequelize';
import db  from '../util/dbConn';
import Brand from './brand.model';
import Country from './country.model';
import State from './state.model';

const ProcessorTraining = db.define('processor_trainings',{
  id: {
    type: DataTypes.INTEGER,
    autoIncrement: true,
    allowNull: false,
    primaryKey: true
  },
  training_type: {
    allowNull: false,
    type: DataTypes.STRING
  },
  brand_id: {
    type: DataTypes.INTEGER,
    foreignKey: true,
    references: { model: 'brands', key: 'id' },
    onDelete: 'SET NULL',
    onUpdate: 'CASCADE',
  },
  country_id: {
    type: DataTypes.INTEGER,
    foreignKey: true,
    references: { model: 'countries', key: 'id' },
    onDelete: 'SET NULL',
    onUpdate: 'CASCADE',
  },
  state_id: {
    type: DataTypes.INTEGER,
    foreignKey: true,
    references: { model: 'states', key: 'id' },
    onDelete: 'SET NULL',
    onUpdate: 'CASCADE',
  },
  processor: {
    allowNull: false,
    type: DataTypes.STRING
  },
  training_mode: {
    allowNull: false,
    type: DataTypes.STRING
  },
  processor_name: {
    type: DataTypes.STRING
  },
  training_description: {
    type: DataTypes.TEXT
  },
  venue: {
    allowNull: false,
    type: DataTypes.TEXT
  },
  date: {
    allowNull: false,
    type: DataTypes.DATE
  },
  start_time: {
    allowNull: false,
    type: DataTypes.TIME
  },
  end_time: {
    type: DataTypes.TIME
  },
  feedback: {
    type: DataTypes.TEXT
  },
  status: {
    type: DataTypes.STRING
  },
});


ProcessorTraining.belongsTo(Brand, {
  foreignKey: "brand_id",
  as: "brand",
})

ProcessorTraining.belongsTo(Country, {
  foreignKey: "country_id",
  as: "country",
})

ProcessorTraining.belongsTo(State, {
  foreignKey: "state_id",
  as: "state",
})


ProcessorTraining.sync();

export default ProcessorTraining;