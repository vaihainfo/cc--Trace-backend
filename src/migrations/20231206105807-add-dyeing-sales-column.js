'use strict';

/** @type {import('sequelize-cli').Migration} */
module.exports = {
  async up (queryInterface, Sequelize) {
    /**
     * Add altering commands here.
     *
     * Example:
     * await queryInterface.createTable('users', { id: Sequelize.INTEGER });
     */
    await queryInterface.removeColumn('dying_sales', 'order_refernce');


    await queryInterface.addColumn('dying_sales', 'garment_order_ref', {
      type: Sequelize.STRING
    });
    await queryInterface.addColumn('dying_sales', 'brand_order_ref', {
      type: Sequelize.STRING
    });
    await queryInterface.addColumn('dying_sales', 'dye_invoice', {
      type: Sequelize.STRING
    });
    await queryInterface.addColumn('dying_sales', 'invoice_files', {
      type: Sequelize.ARRAY(Sequelize.STRING)
    });
    await queryInterface.addColumn('dying_sales', 'other_docs', {
      type: Sequelize.ARRAY(Sequelize.STRING)
    });

    await queryInterface.removeColumn('printing_sales', 'order_refernce');

    await queryInterface.addColumn('printing_sales', 'garment_order_ref', {
      type: Sequelize.STRING
    });
    await queryInterface.addColumn('printing_sales', 'brand_order_ref', {
      type: Sequelize.STRING
    });
    await queryInterface.addColumn('printing_sales', 'invoice_files', {
      type: Sequelize.ARRAY(Sequelize.STRING)
    });
    await queryInterface.addColumn('printing_sales', 'other_docs', {
      type: Sequelize.ARRAY(Sequelize.STRING)
    });

    await queryInterface.removeColumn('washing_sales', 'order_refernce');
    
    await queryInterface.addColumn('washing_sales', 'garment_order_ref', {
      type: Sequelize.STRING
    });
    await queryInterface.addColumn('washing_sales', 'brand_order_ref', {
      type: Sequelize.STRING
    });
    await queryInterface.addColumn('washing_sales', 'invoice_files', {
      type: Sequelize.ARRAY(Sequelize.STRING)
    });
    await queryInterface.addColumn('washing_sales', 'other_docs', {
      type: Sequelize.ARRAY(Sequelize.STRING)
    });

    await queryInterface.removeColumn('compacting_sales', 'order_refernce');
    
    await queryInterface.addColumn('compacting_sales', 'garment_order_ref', {
      type: Sequelize.STRING
    });
    await queryInterface.addColumn('compacting_sales', 'brand_order_ref', {
      type: Sequelize.STRING
    });
    await queryInterface.addColumn('compacting_sales', 'invoice_files', {
      type: Sequelize.ARRAY(Sequelize.STRING)
    });
    await queryInterface.addColumn('compacting_sales', 'other_docs', {
      type: Sequelize.ARRAY(Sequelize.STRING)
    });
    await queryInterface.addColumn('compacting_sales', 'washing_details', {
      type: Sequelize.STRING
    });
    await queryInterface.addColumn('compacting_sales', 'wash_type', {
      type: Sequelize.STRING
    });

  },

  async down (queryInterface, Sequelize) {
    /**
     * Add reverting commands here.
     *
     * Example:
     * await queryInterface.dropTable('users');
     */
    await queryInterface.removeColumn('dying_sales', 'garment_order_ref');
    await queryInterface.removeColumn('dying_sales', 'brand_order_ref');
    await queryInterface.removeColumn('dying_sales', 'dye_invoice');
    await queryInterface.removeColumn('dying_sales', 'invoice_files');
    await queryInterface.removeColumn('dying_sales', 'other_docs');

    await queryInterface.addColumn('dying_sales', 'order_refernce', {
      type: Sequelize.STRING
    });

    await queryInterface.removeColumn('printing_sales', 'garment_order_ref');
    await queryInterface.removeColumn('printing_sales', 'brand_order_ref');
    await queryInterface.removeColumn('printing_sales', 'invoice_files');
    await queryInterface.removeColumn('printing_sales', 'other_docs');

    await queryInterface.addColumn('printing_sales', 'order_refernce', {
      type: Sequelize.STRING
    });

    await queryInterface.removeColumn('washing_sales', 'garment_order_ref');
    await queryInterface.removeColumn('washing_sales', 'brand_order_ref');
    await queryInterface.removeColumn('washing_sales', 'invoice_files');
    await queryInterface.removeColumn('washing_sales', 'other_docs');

    await queryInterface.addColumn('washing_sales', 'order_refernce', {
      type: Sequelize.STRING
    });

    await queryInterface.removeColumn('compacting_sales', 'garment_order_ref');
    await queryInterface.removeColumn('compacting_sales', 'brand_order_ref');
    await queryInterface.removeColumn('compacting_sales', 'invoice_files');
    await queryInterface.removeColumn('compacting_sales', 'other_docs');
    await queryInterface.removeColumn('compacting_sales', 'washing_details');
    await queryInterface.removeColumn('compacting_sales', 'wash_type');

    await queryInterface.addColumn('compacting_sales', 'order_refernce', {
      type: Sequelize.STRING
    });
  }
};
