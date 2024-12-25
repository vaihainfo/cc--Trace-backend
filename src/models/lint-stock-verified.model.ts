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
import TraceabilityExecutive from './traceability-executive.model';
import SupplyChainManager from './supply-chain-manager.model';
import SupplyChainDirector from './supply-chain-director.model';
import BrandExecutive from './brand-executive.model';
import BrandManager from './brand-manager.model';
import PSTeam from './ps-team.model';

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
  confirmed_gin_total_qty: {
    type: DataTypes.DOUBLE
  },
  confirmed_gin_no_of_bales: {
    type: DataTypes.DOUBLE
  },
  confirmed_scm_total_qty: {
    type: DataTypes.DOUBLE
  },
  confirmed_scm_no_of_bales: {
    type: DataTypes.DOUBLE
  },
  confirmed_scd_total_qty: {
    type: DataTypes.DOUBLE
  },
  confirmed_scd_no_of_bales: {
    type: DataTypes.DOUBLE
  },
  confirmed_spin_total_qty: {
    type: DataTypes.DOUBLE
  },
  confirmed_spin_no_of_bales: {
    type: DataTypes.DOUBLE
  },
  confirmed_bm_total_qty: {
    type: DataTypes.DOUBLE
  },
  confirmed_bm_no_of_bales: {
    type: DataTypes.DOUBLE
  },
  confirmed_ps_total_qty: {
    type: DataTypes.DOUBLE
  },
  confirmed_ps_no_of_bales: {
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
  consent_form_be: {
    type: DataTypes.ARRAY(DataTypes.STRING)
  },
  uploaded_photos_be: {
    type: DataTypes.ARRAY(DataTypes.STRING)
  },
  consent_form_bm: {
    type: DataTypes.ARRAY(DataTypes.STRING)
  },
  uploaded_photos_bm: {
    type: DataTypes.ARRAY(DataTypes.STRING)
  },
  consent_form_ps: {
    type: DataTypes.ARRAY(DataTypes.STRING)
  },
  uploaded_photos_ps: {
    type: DataTypes.ARRAY(DataTypes.STRING)
  },
  status: {
    type: DataTypes.STRING
  }, 
  status_bm: {
    type: DataTypes.STRING
  },
  status_ps: {
    type: DataTypes.STRING
  },
  status_scd: {
    type: DataTypes.STRING
  },
  status_scm: {
    type: DataTypes.STRING
  },
  te_id: {
    type: DataTypes.INTEGER
  },
  scm_id: {
    type: DataTypes.INTEGER
  },
  scd_id: {
    type: DataTypes.INTEGER
  },
  be_id: {
    type: DataTypes.INTEGER
  },
  bm_id: {
    type: DataTypes.INTEGER
  },
  ps_id: {
    type: DataTypes.INTEGER
  },
  reason_ginner: {
    type: DataTypes.STRING
  }, 
  reason_scm: {
    type: DataTypes.STRING
  }, 
  reason_scd: {
    type: DataTypes.STRING
  }, 
  reason_spinner: {
    type: DataTypes.STRING
  }, 
  reason_bm: {
    type: DataTypes.STRING
  }, 
  reason_ps: {
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

LintStockVerified.belongsTo(TraceabilityExecutive, {
  foreignKey: "te_id",
  as: "traceability_executive",
})

LintStockVerified.belongsTo(SupplyChainManager, {
  foreignKey: "scm_id",
  as: "supply_chain_manager",
});

LintStockVerified.belongsTo(SupplyChainDirector, {
  foreignKey: "scd_id",
  as: "supply_chain_director",
});

LintStockVerified.belongsTo(BrandExecutive, {
  foreignKey: "be_id",
  as: "brand_executive",
})

LintStockVerified.belongsTo(BrandManager, {
  foreignKey: "bm_id",
  as: "brand_manager",
});

LintStockVerified.belongsTo(PSTeam, {
  foreignKey: "ps_id",
  as: "ps_team",
});

LintStockVerified.sync();

export default LintStockVerified;