import { DataTypes } from 'sequelize';
import db from '../util/dbConn';
import Spinner from './spinner.model';
import Ginner from './ginner.model';
import SpinnerPlaceLintOrderSales from './spinner-place-lint-order-sales.model';

const SpinnerPlaceLintOrder = db.define('spinner_place_lint_orders', {
  id: {
    type: DataTypes.INTEGER,
    autoIncrement: true,
    primaryKey: true,
  },
  spinnerId: {
    type: DataTypes.INTEGER,
    allowNull: false,
    references: {
      model: 'spinners',
      key: 'id',
    },
  },
  ginnerId: {
    type: DataTypes.INTEGER,
    allowNull: false,
    references: {
      model: 'ginners',
      key: 'id',
    },
  },
  quotationDate: {
    type: DataTypes.DATE,
    allowNull: false,
  },
  dateCreatedOnTraceBale: {
    type: DataTypes.DATE,
    allowNull: false,
  },
  quoteProcedureNo: {
    type: DataTypes.STRING,
    allowNull: false,
  },
  traceableReelQuotationOrderNumber: {
    type: DataTypes.STRING,
    allowNull: true,
  },
  ginnerContactPersonName: {
    type: DataTypes.STRING,
    allowNull: false,
  },
  ginnerContactPersonNumber: {
    type: DataTypes.STRING,
    allowNull: false,
  },
  ginnerMailId: {
    type: DataTypes.STRING,
    allowNull: false,
  },
  ginnerAddress: {
    type: DataTypes.TEXT,
    allowNull: false,
  },
  orderMaterial: {
    type: DataTypes.STRING,
    allowNull: false,
  },
  lintQuality: {
    type: DataTypes.STRING,
    allowNull: false,
  },
  mic: {
    type: DataTypes.STRING,
    allowNull: false,
  },
  uhml: {
    type: DataTypes.STRING,
    allowNull: false,
  },
  mat: {
    type: DataTypes.STRING,
    allowNull: false,
  },
  ui: {
    type: DataTypes.STRING,
    allowNull: false,
  },
  strength: {
    type: DataTypes.STRING,
    allowNull: false,
  },
  moisture: {
    type: DataTypes.STRING,
    allowNull: false,
  },
  sfi: {
    type: DataTypes.STRING,
    allowNull: false,
  },
  rdValue: {
    type: DataTypes.STRING,
    allowNull: false,
  },
  totalLintQuantity: {
    type: DataTypes.STRING,
    allowNull: false,
  },
  totalBales: {
    type: DataTypes.STRING,
    allowNull: false,
  },
  pricePerCandy: {
    type: DataTypes.STRING,
    allowNull: false,
  },
  dispatchWithinDays: {
    type: DataTypes.STRING,
    allowNull: false,
  },
  tentativeDispatchDate: {
    type: DataTypes.DATE,
    allowNull: false,
  },
  quotationValidTillDate: {
    type: DataTypes.DATE,
    allowNull: false,
  },
  insuranceCoverageDetails: {
    type: DataTypes.TEXT,
    allowNull: false,
  },
  comments: {
    type: DataTypes.TEXT,
    allowNull: true,
  },
  insuranceDocument: {
    type: DataTypes.TEXT,
    allowNull: true,
  },
  otherDocument1: {
    type: DataTypes.TEXT,
    allowNull: true,
  },
  otherDocument2: {
    type: DataTypes.TEXT,
    allowNull: true,
  },
  orderDocumentPdfLink: {
    type: DataTypes.TEXT,
    allowNull: true,
  },
  spinner_status: {
    type: DataTypes.ENUM('pending', 'approved', 'rejected', 'lint_dispatch'),
    defaultValue: 'pending',
    allowNull: false,
  },
  spinner_status_updated_at: {
    type: DataTypes.DATE,
    allowNull: true,
  },
  ginner_status: {
    type: DataTypes.ENUM('pending', 'approved', 'rejected'),
    defaultValue: 'pending',
    allowNull: false,
  },
  ginner_status_updated_at: {
    type: DataTypes.DATE,
    allowNull: true,
  },
  brand_status: {
    type: DataTypes.ENUM('pending', 'approved', 'rejected'),
    defaultValue: 'pending',
    allowNull: false,
  },
  brand_status_updated_at: {
    type: DataTypes.DATE,
    allowNull: true,
  }
}, {
  timestamps: true,
  paranoid: true,
});

// Define associations
SpinnerPlaceLintOrder.belongsTo(Spinner, {
  foreignKey: 'spinnerId',
  as: 'spinner',
});

SpinnerPlaceLintOrder.belongsTo(Ginner, {
  foreignKey: 'ginnerId',
  as: 'ginner',
});

// Add association with SpinnerPlaceLintOrderSales
SpinnerPlaceLintOrder.hasMany(SpinnerPlaceLintOrderSales, {
  foreignKey: 'spinner_place_lint_order_id',
  as: 'LintOrderSales',
});

SpinnerPlaceLintOrder.sync();

export default SpinnerPlaceLintOrder;
