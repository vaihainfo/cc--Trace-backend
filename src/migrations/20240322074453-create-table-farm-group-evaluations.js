'use strict';

/** @type {import('sequelize-cli').Migration} */
module.exports = {
  async up(queryInterface, Sequelize) {
    /**
     * Add altering commands here.
     *
     * Example:
     * await queryInterface.createTable('users', { id: Sequelize.INTEGER });
     */
    await queryInterface.createTable('farm_group_evaluations', {
      id: {
        type: Sequelize.INTEGER,
        autoIncrement: true,
        allowNull: false,
        primaryKey: true
      },
      season_id: {
        type: Sequelize.INTEGER,
        allowNull: false
      },
      agronomist_name: {
        type: Sequelize.STRING,
        allowNull: false
      },
      visit_from: {
        type: Sequelize.DATE,
        allowNull: false
      },
      visit_to: {
        type: Sequelize.DATE,
        allowNull: false
      },
      farm_group_id: {
        type: Sequelize.INTEGER,
        allowNull: false
      },
      address: {
        type: Sequelize.STRING,
        allowNull: false
      },
      registration_details: {
        type: Sequelize.STRING,
        allowNull: false
      },
      company_type: {
        type: Sequelize.STRING,
        allowNull: false
      },
      parent_company_name: {
        type: Sequelize.STRING,
        allowNull: false
      },
      owner_name: {
        type: Sequelize.STRING,
        allowNull: false
      },
      establishment_year: {
        type: Sequelize.STRING,
        allowNull: false
      },
      district_project_presence: {
        type: Sequelize.STRING,
        allowNull: false
      },
      program_type_by_organization: {
        type: Sequelize.STRING,
        allowNull: false
      },
      total_beneficiaries: {
        type: Sequelize.STRING,
        allowNull: false
      },
      brand_id: {
        type: Sequelize.INTEGER,
        allowNull: false
      },
      sustainable_cotton_program_type: {
        type: Sequelize.STRING,
        allowNull: false
      },
      total_no_farmers_in_organic_cotton: {
        type: Sequelize.INTEGER,
        allowNull: false
      },
      program_wise_no_farmers_in_other_sustain_cotton_program: {
        type: Sequelize.INTEGER,
        allowNull: false
      },
      total_number_of_current_ics: {
        type: Sequelize.STRING,
        allowNull: false
      },
      name_of_organic_certification_agencies: {
        type: Sequelize.STRING,
        allowNull: false
      },
      cotton_variety_grown_in_program_areas: {
        type: Sequelize.STRING,
        allowNull: false
      },
      state: {
        type: Sequelize.STRING,
        allowNull: false
      },
      district: {
        type: Sequelize.STRING,
        allowNull: false
      },
      block: {
        type: Sequelize.STRING,
        allowNull: false
      },
      village: {
        type: Sequelize.TEXT,
        allowNull: false
      },
      no_of_farmers_met: {
        type: Sequelize.INTEGER,
        allowNull: false
      },
      scope_certificate_of_last_year_based_on_ics_score: {
        type: Sequelize.INTEGER,
        allowNull: false
      },
      scope_certificate_of_last_year_based_on_ics_remarks_doc: {
        type: Sequelize.STRING,
        allowNull: true,
        defaultValue: null
      },
      scope_certificate_of_last_year_based_on_ics_action: {
        type: Sequelize.STRING,
        allowNull: false
      },
      farmer_field_dairy_score: {
        type: Sequelize.INTEGER,
        allowNull: false
      },
      farmer_field_dairy_remarks_doc: {
        type: Sequelize.STRING,
        allowNull: true,
        defaultValue: null
      },
      farmer_field_dairy_action: {
        type: Sequelize.STRING,
        allowNull: false
      },
      farmer_training_attendence_register_score: {
        type: Sequelize.INTEGER,
        allowNull: false
      },
      farmer_training_attendence_register_remarks_doc: {
        type: Sequelize.STRING,
        allowNull: true,
        defaultValue: null
      },
      farmer_training_attendence_register_action: {
        type: Sequelize.STRING,
        allowNull: false
      },
      demonstration_register_score: {
        type: Sequelize.INTEGER,
        allowNull: false
      },
      demonstration_register_remarks_doc: {
        type: Sequelize.STRING,
        allowNull: true,
        defaultValue: null
      },
      demonstration_register_action: {
        type: Sequelize.STRING,
        allowNull: false
      },
      farmers_are_aware_of_organization_score: {
        type: Sequelize.INTEGER,
        allowNull: false
      },
      farmers_are_aware_of_organization_remarks: {
        type: Sequelize.STRING,
        allowNull: false
      },
      farmers_getting_support_of_any_kind_score: {
        type: Sequelize.INTEGER,
        allowNull: false
      },
      farmers_getting_support_of_any_kind_remarks: {
        type: Sequelize.STRING,
        allowNull: false
      },
      frequency_of_selling_your_cotton_to_the_organization_score: {
        type: Sequelize.INTEGER,
        allowNull: false
      },
      frequency_of_selling_your_cotton_to_the_organization_remarks: {
        type: Sequelize.STRING,
        allowNull: false
      },
      farmers_associated_organic_program_score: {
        type: Sequelize.INTEGER,
        allowNull: false
      },
      farmers_associated_organic_program_remarks: {
        type: Sequelize.STRING,
        allowNull: false
      },
      farmers_associated_organic_program_remarks_doc: {
        type: Sequelize.STRING,
        allowNull: true,
        defaultValue: null
      },
      field_executive_support_by_imparing_knowledge_score: {
        type: Sequelize.INTEGER,
        allowNull: false
      },
      field_executive_support_by_imparing_knowledge_remarks: {
        type: Sequelize.STRING,
        allowNull: false
      },
      farmers_knows_the_name_of_field_executive_score: {
        type: Sequelize.INTEGER,
        allowNull: false
      },
      farmers_knows_the_name_of_field_executive_remarks: {
        type: Sequelize.STRING,
        allowNull: false
      },
      awareness_of_the_farmers_organic_practices_score: {
        type: Sequelize.INTEGER,
        allowNull: false
      },
      awareness_of_the_farmers_organic_practices_remarks: {
        type: Sequelize.STRING,
        allowNull: false
      },
      awareness_of_the_farmers_regarding_organic_certification_score: {
        type: Sequelize.INTEGER,
        allowNull: false
      },
      awareness_of_the_farmers_regarding_organic_certification_remarks: {
        type: Sequelize.STRING,
        allowNull: false
      },
      created_by: {
        type: Sequelize.INTEGER,
        allowNull: false
      },
      createdAt: {
        allowNull: false,
        type: Sequelize.DATE
      },
      updatedAt: {
        allowNull: false,
        type: Sequelize.DATE
      }
    });
  },

  async down(queryInterface, Sequelize) {
    /**
     * Add reverting commands here.
     *
     * Example:
     * await queryInterface.dropTable('users');
     */
    await queryInterface.dropTable('farm_group_evaluations');
  }
};
