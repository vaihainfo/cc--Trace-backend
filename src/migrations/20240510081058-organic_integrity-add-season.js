module.exports = {
  async up(queryInterface, Sequelize) {
    // Add the 'season_id' column
    await queryInterface.addColumn('organic_integrities', 'season_id', {
      type: Sequelize.INTEGER,
      allowNull: true, 
    });

  },

  async down(queryInterface, Sequelize) {
    // Remove the 'season_id' column
    await queryInterface.removeColumn('organic_integrities', 'season_id');
  }
};
