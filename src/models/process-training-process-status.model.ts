import { DataTypes } from 'sequelize';
import db from '../util/dbConn';
import Ginner from './ginner.model';
import Spinner from './spinner.model';
import Weaver from './weaver.model';
import Knitter from './knitter.model';
import Garment from './garment.model';
import ProcessorTraining from './processor-training.model';
import Trader from './trader.model';

const ProcessTrainingProcessStatus = db.define('process_training_process_statuses', {
  id: {
    allowNull: false,
    autoIncrement: true,
    primaryKey: true,
    type: DataTypes.INTEGER
  },
  process_training_id: {
    type: DataTypes.INTEGER
  },
  spinner_id: {
    type: DataTypes.INTEGER
  },
  ginner_id: {
    type: DataTypes.INTEGER
  },
  weaver_id: {
    type: DataTypes.INTEGER
  },
  knitter_id: {
    type: DataTypes.INTEGER
  },
  trader_id: {
    type: DataTypes.INTEGER
  },
  garment_id: {
    type: DataTypes.INTEGER
  },
  status: {
    type: DataTypes.STRING,
  },
  feedback: {
    type: DataTypes.STRING,
  },
});

ProcessTrainingProcessStatus.belongsTo(Spinner, {
  foreignKey: "spinner_id",
  as: "spinner",
});

ProcessTrainingProcessStatus.belongsTo(Ginner, {
  foreignKey: "ginner_id",
  as: "ginner",
});

ProcessTrainingProcessStatus.belongsTo(Weaver, {
  foreignKey: "weaver_id",
  as: "weaver",
});

ProcessTrainingProcessStatus.belongsTo(Knitter, {
  foreignKey: "knitter_id",
  as: "knitter",
});

ProcessTrainingProcessStatus.belongsTo(Garment, {
  foreignKey: "garment_id",
  as: "garment",
});

ProcessTrainingProcessStatus.belongsTo(Trader, {
  foreignKey: "trader_id",
  as: "trader",
});
ProcessTrainingProcessStatus.belongsTo(ProcessorTraining, {
  foreignKey: "process_training_id",
  as: "process-training",
});



ProcessTrainingProcessStatus.sync();

export default ProcessTrainingProcessStatus;