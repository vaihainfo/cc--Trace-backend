import { DataTypes } from 'sequelize';
import db from '../util/dbConn';
import Season from './season.model';
import FarmGroup from './farm-group.model';
import Brand from './brand.model';

const FarmGroupEvaluation = db.define('farm_group_evaluation', {
    id: {
        type: DataTypes.INTEGER,
        autoIncrement: true,
        allowNull: false,
        primaryKey: true
    },
    season_id: {
        type: DataTypes.INTEGER,
        allowNull: false
    },
    agronomist_name: {
        type: DataTypes.STRING,
        allowNull: false
    },
    visit_from: {
        type: DataTypes.DATE,
        allowNull: false
    },
    visit_to: {
        type: DataTypes.DATE,
        allowNull: false
    },
    farm_group_id: {
        type: DataTypes.INTEGER,
        allowNull: false
    },
    address: {
        type: DataTypes.STRING,
        allowNull: false
    },
    registration_details: {
        type: DataTypes.STRING,
        allowNull: false
    },
    company_type: {
        type: DataTypes.STRING,
        allowNull: false
    },
    parent_company_name: {
        type: DataTypes.STRING,
        allowNull: false
    },
    owner_name: {
        type: DataTypes.STRING,
        allowNull: false
    },
    establishment_year: {
        type: DataTypes.STRING,
        allowNull: false
    },
    district_project_presence: {
        type: DataTypes.STRING,
        allowNull: false
    },
    program_type_by_organization: {
        type: DataTypes.STRING,
        allowNull: false
    },
    total_beneficiaries: {
        type: DataTypes.STRING,
        allowNull: false
    },
    brand_id: {
        type: DataTypes.INTEGER,
        allowNull: false
    },
    sustainable_cotton_program_type: {
        type: DataTypes.STRING,
        allowNull: false
    },
    total_no_farmers_in_organic_cotton: {
        type: DataTypes.INTEGER,
        allowNull: false
    },
    program_wise_no_farmers_in_other_sustain_cotton_program: {
        type: DataTypes.INTEGER,
        allowNull: false
    },
    total_number_of_current_ics: {
        type: DataTypes.STRING,
        allowNull: false
    },
    name_of_organic_certification_agencies: {
        type: DataTypes.STRING,
        allowNull: false
    },
    cotton_variety_grown_in_program_areas: {
        type: DataTypes.STRING,
        allowNull: false
    },
    state: {
        type: DataTypes.STRING,
        allowNull: false
    },
    district: {
        type: DataTypes.STRING,
        allowNull: false
    },
    block: {
        type: DataTypes.STRING,
        allowNull: false
    },
    village: {
        type: DataTypes.TEXT,
        allowNull: false
    },
    no_of_farmers_met: {
        type: DataTypes.INTEGER,
        allowNull: false
    },
    scope_certificate_of_last_year_based_on_ics_score: {
        type: DataTypes.INTEGER,
        allowNull: false
    },
    scope_certificate_of_last_year_based_on_ics_remarks_doc: {
        type: DataTypes.STRING,
        allowNull: true,
        defaultValue: null
    },
    scope_certificate_of_last_year_based_on_ics_action: {
        type: DataTypes.STRING,
        allowNull: false
    },
    farmer_field_dairy_score: {
        type: DataTypes.INTEGER,
        allowNull: false
    },
    farmer_field_dairy_remarks_doc: {
        type: DataTypes.STRING,
        allowNull: true,
        defaultValue: null
    },
    farmer_field_dairy_action: {
        type: DataTypes.STRING,
        allowNull: false
    },
    farmer_training_attendence_register_score: {
        type: DataTypes.INTEGER,
        allowNull: false
    },
    farmer_training_attendence_register_remarks_doc: {
        type: DataTypes.STRING,
        allowNull: true,
        defaultValue: null
    },
    farmer_training_attendence_register_action: {
        type: DataTypes.STRING,
        allowNull: false
    },
    demonstration_register_score: {
        type: DataTypes.INTEGER,
        allowNull: false
    },
    demonstration_register_remarks_doc: {
        type: DataTypes.STRING,
        allowNull: true,
        defaultValue: null
    },
    demonstration_register_action: {
        type: DataTypes.STRING,
        allowNull: false
    },
    farmers_are_aware_of_organization_score: {
        type: DataTypes.INTEGER,
        allowNull: false
    },
    farmers_are_aware_of_organization_remarks: {
        type: DataTypes.STRING,
        allowNull: false
    },
    farmers_getting_support_of_any_kind_score: {
        type: DataTypes.INTEGER,
        allowNull: false
    },
    farmers_getting_support_of_any_kind_remarks: {
        type: DataTypes.STRING,
        allowNull: false
    },
    frequency_of_selling_your_cotton_to_the_organization_score: {
        type: DataTypes.INTEGER,
        allowNull: false
    },
    frequency_of_selling_your_cotton_to_the_organization_remarks: {
        type: DataTypes.STRING,
        allowNull: false
    },
    farmers_associated_organic_program_score: {
        type: DataTypes.INTEGER,
        allowNull: false
    },
    farmers_associated_organic_program_remarks: {
        type: DataTypes.STRING,
        allowNull: false
    },
    farmers_associated_organic_program_remarks_doc: {
        type: DataTypes.STRING,
        allowNull: true,
        defaultValue: null
    },
    field_executive_support_by_imparing_knowledge_score: {
        type: DataTypes.INTEGER,
        allowNull: false
    },
    field_executive_support_by_imparing_knowledge_remarks: {
        type: DataTypes.STRING,
        allowNull: false
    },
    farmers_knows_the_name_of_field_executive_score: {
        type: DataTypes.INTEGER,
        allowNull: false
    },
    farmers_knows_the_name_of_field_executive_remarks: {
        type: DataTypes.STRING,
        allowNull: false
    },
    awareness_of_the_farmers_organic_practices_score: {
        type: DataTypes.INTEGER,
        allowNull: false
    },
    awareness_of_the_farmers_organic_practices_remarks: {
        type: DataTypes.STRING,
        allowNull: false
    },
    awareness_of_the_farmers_regarding_organic_certification_score: {
        type: DataTypes.INTEGER,
        allowNull: false
    },
    awareness_of_the_farmers_regarding_organic_certification_remarks: {
        type: DataTypes.STRING,
        allowNull: false
    },
    created_by: {
        type: DataTypes.INTEGER,
        allowNull: false
    },
});

FarmGroupEvaluation.belongsTo(Season, {
    foreignKey: "season_id",
    as: "season"
});

FarmGroupEvaluation.belongsTo(FarmGroup, {
    foreignKey: "farm_group_id",
    as: "farm_group"
});

FarmGroupEvaluation.belongsTo(Brand, {
    foreignKey: "brand_id",
    as: "brand"
});

export default FarmGroupEvaluation;