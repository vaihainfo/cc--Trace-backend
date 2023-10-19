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
    return await Promise.all([
      queryInterface.addColumn('spinners', 'registration_document', {
        type: Sequelize.STRING
      }),
      queryInterface.addColumn('ginners', 'registration_document', {
        type: Sequelize.STRING
      }),
      queryInterface.addColumn('weavers', 'registration_document', {
        type: Sequelize.STRING
      }),
      queryInterface.addColumn('garments', 'registration_document', {
        type: Sequelize.STRING
      }),
      queryInterface.addColumn('fabrics', 'registration_document', {
        type: Sequelize.STRING
      }),
      queryInterface.addColumn('knitters', 'registration_document', {
        type: Sequelize.STRING
      }),
      queryInterface.addColumn('traders', 'registration_document', {
        type: Sequelize.STRING
      }),
      queryInterface.addColumn('users', 'process_role', {
        type: Sequelize.ARRAY(Sequelize.INTEGER)
      })
    ])
  },

  async down(queryInterface, Sequelize) {
    /**
     * Add reverting commands here.
     *
     * Example:
     * await queryInterface.dropTable('users');
     */
    return await Promise.all([
      queryInterface.removeColumn('spinners', 'registration_document'),
      queryInterface.removeColumn('ginners', 'registration_document'),
      queryInterface.removeColumn('weavers', 'registration_document'),
      queryInterface.removeColumn('garments', 'registration_document'),
      queryInterface.removeColumn('fabrics', 'registration_document'),
      queryInterface.removeColumn('knitters', 'registration_document'),
      queryInterface.removeColumn('traders', 'registration_document'),
      queryInterface.removeColumn('users', 'process_role')
    ]);
  }
};
