import { DataTypes } from 'sequelize';
import db from '../util/dbConn';

import Ginner from './ginner.model';
import Season from './season.model';
import Program from './program.model';
import Spinner from './spinner.model';
import Country from './country.model';
import State from './state.model';
import GinProcess from './gin-process.model';
import GinSales from './gin-sales.model';

const LintStockVerified = db.define('lint_stock_verifieds', {
  id: {
    type: DataTypes.INTEGER,
    autoIncrement: true,
    allowNull: false,
    primaryKey: true
  },
  ginner_id: {
    type: DataTypes.INTEGER,
  },
  spinner_id: {
    type: DataTypes.INTEGER
  },
  country_id: {
    allowNull: false,
    type: DataTypes.INTEGER
  },
  state_id: {
    allowNull: false,
    type: DataTypes.INTEGER
  },
  total_qty: {
    type: DataTypes.DOUBLE
  },
  no_of_bales: {
    type: DataTypes.DOUBLE
  },
  lot_no: {
    allowNull: false,
    type: DataTypes.TEXT
  },
  reel_lot_no: {
    type: DataTypes.TEXT
  },
  processor_type: {
    type: DataTypes.STRING
  },
  process_id: {
    type: DataTypes.INTEGER
  },
  sales_id: {
    type: DataTypes.INTEGER
  },
  actual_total_qty: {
    type: DataTypes.DOUBLE
  },
  actual_no_of_bales: {
    type: DataTypes.DOUBLE
  },
  consent_form_te: {
    type: DataTypes.ARRAY(DataTypes.STRING)
  },
  uploaded_photos_te: {
    type: DataTypes.ARRAY(DataTypes.STRING)
  },
  consent_form_scm: {
    type: DataTypes.ARRAY(DataTypes.STRING)
  },
  uploaded_photos_scm: {
    type: DataTypes.ARRAY(DataTypes.STRING)
  },
  consent_form_scd: {
    type: DataTypes.ARRAY(DataTypes.STRING)
  },
  uploaded_photos_scd: {
    type: DataTypes.ARRAY(DataTypes.STRING)
  },
  consent_form_ginner: {
    type: DataTypes.ARRAY(DataTypes.STRING)
  },
  uploaded_photos_ginner: {
    type: DataTypes.ARRAY(DataTypes.STRING)
  },
  consent_form_spinner: {
    type: DataTypes.ARRAY(DataTypes.STRING)
  },
  uploaded_photos_spinner: {
    type: DataTypes.ARRAY(DataTypes.STRING)
  },
  status: {
    type: DataTypes.STRING
  },
  status_scm: {
    type: DataTypes.STRING
  },
  status_scd: {
    type: DataTypes.STRING
  },
});

LintStockVerified.belongsTo(Country, {
  foreignKey: "country_id",
  as: "country",
});

LintStockVerified.belongsTo(State, {
  foreignKey: "state_id",
  as: "state",
});


LintStockVerified.belongsTo(Ginner, {
  foreignKey: "ginner_id",
  as: "ginner",
});

LintStockVerified.belongsTo(Spinner, {
  foreignKey: "spinner_id",
  as: "spinner",
});

LintStockVerified.belongsTo(GinProcess, {
  foreignKey: "process_id",
  as: "ginprocess",
});

LintStockVerified.belongsTo(GinSales, {
  foreignKey: "sales_id",
  as: "ginsales",
});

LintStockVerified.sync();

export default LintStockVerified;