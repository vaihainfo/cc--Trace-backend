'use strict';

/** @type {import('sequelize-cli').Migration} */
module.exports = {
  async up(queryInterface, Sequelize) {
    await queryInterface.changeColumn('spinner_place_lint_orders', 'mat', {
      type: Sequelize.STRING,
      allowNull: true,
    });

    await queryInterface.changeColumn('spinner_place_lint_orders', 'sfi', {
      type: Sequelize.STRING,
      allowNull: true,
    });

    await queryInterface.changeColumn('spinner_place_lint_orders', 'totalLintQuantity', {
      type: Sequelize.STRING,
      allowNull: true,
    });

    await queryInterface.changeColumn('spinner_place_lint_orders', 'pricePerCandy', {
      type: Sequelize.STRING,
      allowNull: true,
    });

    await queryInterface.changeColumn('spinner_place_lint_orders', 'dispatchWithinDays', {
      type: Sequelize.STRING,
      allowNull: true,
    });

    await queryInterface.changeColumn('spinner_place_lint_orders', 'tentativeDispatchDate', {
      type: Sequelize.DATE,
      allowNull: true,
    });

    await queryInterface.changeColumn('spinner_place_lint_orders', 'quotationValidTillDate', {
      type: Sequelize.DATE,
      allowNull: true,
    });
  },

  async down(queryInterface, Sequelize) {
    await queryInterface.changeColumn('spinner_place_lint_orders', 'mat', {
      type: Sequelize.STRING,
      allowNull: false,
    });

    await queryInterface.changeColumn('spinner_place_lint_orders', 'sfi', {
      type: Sequelize.STRING,
      allowNull: false,
    });

    await queryInterface.changeColumn('spinner_place_lint_orders', 'totalLintQuantity', {
      type: Sequelize.STRING,
      allowNull: false,
    });

    await queryInterface.changeColumn('spinner_place_lint_orders', 'pricePerCandy', {
      type: Sequelize.STRING,
      allowNull: false,
    });

    await queryInterface.changeColumn('spinner_place_lint_orders', 'dispatchWithinDays', {
      type: Sequelize.STRING,
      allowNull: false,
    });

    await queryInterface.changeColumn('spinner_place_lint_orders', 'tentativeDispatchDate', {
      type: Sequelize.DATE,
      allowNull: false,
    });

    await queryInterface.changeColumn('spinner_place_lint_orders', 'quotationValidTillDate', {
      type: Sequelize.DATE,
      allowNull: false,
    });
  },
};
