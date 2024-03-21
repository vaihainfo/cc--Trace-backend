import { DataTypes } from 'sequelize';
import db from '../util/dbConn';
import Brand from './brand.model';
import Season from './season.model';
import FarmGroup from './farm-group.model';

const ValidationProject = db.define('validation_projects', {
  id: {
    type: DataTypes.INTEGER,
    autoIncrement: true,
    allowNull: false,
    primaryKey: true
  },
  date: {
    allowNull: false,
    type: DataTypes.DATE
  },
  season_id: {
    allowNull: false,
    type: DataTypes.INTEGER
  },
  brand_id: {
    allowNull: false,
    type: DataTypes.INTEGER
  },
  farmGroup_id: {
    allowNull: false,
    type: DataTypes.INTEGER
  },
  no_of_farmers: {
    type: DataTypes.DOUBLE
  },
  cotton_purchased: {
    type: DataTypes.DOUBLE
  },
  qty_of_lint_sold: {
    type: DataTypes.INTEGER
  },
  premium_recieved: {
    allowNull: false,
    type: DataTypes.DOUBLE
  },
  premium_transfered: {
    allowNull: false,
    type: DataTypes.ARRAY(DataTypes.STRING)
  },
  premium_transfered_name: {
    type: DataTypes.ARRAY(DataTypes.STRING)
  },
  premium_transfered_cost: {
    type: DataTypes.ARRAY(DataTypes.STRING)
  },
  avg_purchase_price: {
    allowNull: false,
    type: DataTypes.DOUBLE
  },
  avg_market_price: {
    allowNull: false,
    type: DataTypes.DOUBLE
  },
  price_variance: {
    type: DataTypes.INTEGER
  },
  calculated_avg_variance: {
    allowNull: false,
    type: DataTypes.DOUBLE
  },
  premium_transfer_claim: {
    allowNull: false,
    type: DataTypes.DOUBLE
  },
  claim_variance: {
    type: DataTypes.INTEGER
  },
});


ValidationProject.belongsTo(Brand, {
  foreignKey: "brand_id",
  as: "brand",
})

ValidationProject.belongsTo(Season, {
  foreignKey: "season_id",
  as: "season",
})

ValidationProject.belongsTo(FarmGroup, {
  foreignKey: "farmGroup_id",
  as: "farmGroup",
})

ValidationProject.sync();

export default ValidationProject;