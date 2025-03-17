'use strict';

/** @type {import('sequelize-cli').Migration} */
module.exports = {
  async up(queryInterface, Sequelize) {
    await queryInterface.createTable('spinner_place_lint_orders', {
      id: {
        allowNull: false,
        autoIncrement: true,
        primaryKey: true,
        type: Sequelize.INTEGER
      },
      spinnerId: {
        type: Sequelize.INTEGER,
        allowNull: false,
        references: {
          model: 'spinners',
          key: 'id'
        },
        onDelete: 'CASCADE'
      },
      ginnerId: {
        type: Sequelize.INTEGER,
        allowNull: false,
        references: {
          model: 'ginners',
          key: 'id'
        },
        onDelete: 'CASCADE'
      },
      quotationDate: {
        type: Sequelize.DATE,
        allowNull: false
      },
      dateCreatedOnTraceBale: {
        type: Sequelize.DATE,
        allowNull: false
      },
      quoteProcedureNo: {
        type: Sequelize.STRING,
        allowNull: false
      },
      traceableReelQuotationOrderNumber: {
        type: Sequelize.STRING,
        allowNull: true
      },
      ginnerContactPersonName: {
        type: Sequelize.STRING,
        allowNull: false
      },
      ginnerContactPersonNumber: {
        type: Sequelize.STRING,
        allowNull: false
      },
      ginnerMailId: {
        type: Sequelize.STRING,
        allowNull: false
      },
      ginnerAddress: {
        type: Sequelize.TEXT,
        allowNull: false
      },
      orderMaterial: {
        type: Sequelize.STRING,
        allowNull: false
      },
      lintQuality: {
        type: Sequelize.STRING,
        allowNull: false
      },
      mic: {
        type: Sequelize.STRING,
        allowNull: false
      },
      uhml: {
        type: Sequelize.STRING,
        allowNull: false
      },
      mat: {
        type: Sequelize.STRING,
        allowNull: false
      },
      ui: {
        type: Sequelize.STRING,
        allowNull: false
      },
      strength: {
        type: Sequelize.STRING,
        allowNull: false
      },
      moisture: {
        type: Sequelize.STRING,
        allowNull: false
      },
      sfi: {
        type: Sequelize.STRING,
        allowNull: false
      },
      rdValue: {
        type: Sequelize.STRING,
        allowNull: false
      },
      totalLintQuantity: {
        type: Sequelize.STRING,
        allowNull: false
      },
      totalBales: {
        type: Sequelize.STRING,
        allowNull: false
      },
      pricePerCandy: {
        type: Sequelize.STRING,
        allowNull: false
      },
      dispatchWithinDays: {
        type: Sequelize.STRING,
        allowNull: false
      },
      tentativeDispatchDate: {
        type: Sequelize.DATE,
        allowNull: false
      },
      quotationValidTillDate: {
        type: Sequelize.DATE,
        allowNull: false
      },
      insuranceCoverageDetails: {
        type: Sequelize.TEXT,
        allowNull: false
      },
      comments: {
        type: Sequelize.TEXT,
        allowNull: true
      },
      insuranceDocument: {
        type: Sequelize.TEXT,
        allowNull: true
      },
      otherDocument1: {
        type: Sequelize.TEXT,
        allowNull: true
      },
      otherDocument2: {
        type: Sequelize.TEXT,
        allowNull: true
      },
      orderDocumentPdfLink: {
        type: Sequelize.TEXT,
        allowNull: true
      },
      status: {
        type: Sequelize.ENUM('pending', 'approved', 'rejected'),
        defaultValue: 'pending',
        allowNull: false
      },
      createdAt: {
        allowNull: false,
        type: Sequelize.DATE
      },
      updatedAt: {
        allowNull: false,
        type: Sequelize.DATE
      },
      deletedAt: {
        type: Sequelize.DATE,
        allowNull: true
      }
    });

     // First, we need to update the enum type by adding the new values
     await queryInterface.sequelize.query(`
      ALTER TYPE enum_spinner_place_lint_orders_status 
      ADD VALUE IF NOT EXISTS 'accepted by Brand';
    `);

    await queryInterface.sequelize.query(`
      ALTER TYPE enum_spinner_place_lint_orders_status 
      ADD VALUE IF NOT EXISTS 'Lint Dispatch';
    `);
  },

  async down(queryInterface, Sequelize) {
    await queryInterface.dropTable('spinner_place_lint_orders');
  }
};
