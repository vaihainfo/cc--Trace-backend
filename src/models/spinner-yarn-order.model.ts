import { DataTypes } from 'sequelize';
import db from '../util/dbConn';
import SpinnerYarnOrderSales from './spinner-yarn-order-sales.model';
import YarnOrderProcess from './yarn-order-process.model';

const SpinnerYarnOrder = db.define('spinner_yarn_orders', {
  id: {
    type: DataTypes.INTEGER,
    autoIncrement: true,
    allowNull: false,
    primaryKey: true
  },
  spinnerId: {
    type: DataTypes.INTEGER,
    allowNull: false,
    references: {
      model: 'spinners',
      key: 'id'
    }
  },
  date: {
    type: DataTypes.DATE,
    allowNull: false,
  },
  orderReceivedDate: {
    type: DataTypes.DATE,
    allowNull: false,
  },
  expectedYarnDispatchDate: {
    type: DataTypes.DATE,
    allowNull: false,
  },
  brandOrderRefNumber: {
    type: DataTypes.STRING,
    allowNull: false,
  },
  fabricMillOrderRefNumber: {
    type: DataTypes.STRING,
    allowNull: false,
  },
  dateFabricMillPlacedOrder: {
    type: DataTypes.DATE,
    allowNull: false,
  },
  spinnerInternalOrderNumber: {
    type: DataTypes.STRING,
    allowNull: false,
  },
  reel_yarn_order_number: {
    type: DataTypes.STRING(100),
    allowNull: true,
    unique: true
  },
  yarnBlend: {
    type: DataTypes.INTEGER,
    allowNull: false,
    references: {
      model: 'cotton_mixes',
      key: 'id'
    }
  },
  yarnTypeSelect: {
    type: DataTypes.STRING,
    allowNull: false,
  },
  yarnTypeOther: {
    type: DataTypes.STRING,
    allowNull: true,
  },
  yarnCount: {
    type: DataTypes.INTEGER,
    allowNull: false,
    references: {
      model: 'yarn_counts',
      key: 'id'
    }
  },
  totalOrderQuantity: {
    type: DataTypes.STRING,
    allowNull: false,
  },
  tentativeOrderCompletionDate: {
    type: DataTypes.DATE,
    allowNull: false,
  },
  buyerType: {
    type: DataTypes.ENUM('Mapped', 'New Buyer'),
    allowNull: false,
  },
  buyerOption: {
    type: DataTypes.INTEGER,
    allowNull: true
  },
  buyer_option_type: {
    type: DataTypes.STRING,
    allowNull: true
  },
  processId: {
    type: DataTypes.INTEGER,
    allowNull: true
  },
  order_document: {
    type: DataTypes.STRING,
    allowNull: true,
  },
  contract_files: {
    type: DataTypes.STRING,
    allowNull: true,
  },
  other_files: {
    type: DataTypes.STRING,
    allowNull: true,
  },
});

SpinnerYarnOrder.hasMany(SpinnerYarnOrderSales, {
  foreignKey: 'spinner_yarn_order_id',
  as: 'YarnOrderSales'
});

SpinnerYarnOrder.belongsTo(YarnOrderProcess, {
  foreignKey: 'processId',
  as: 'YarnOrderProcess'
});

export default SpinnerYarnOrder;
